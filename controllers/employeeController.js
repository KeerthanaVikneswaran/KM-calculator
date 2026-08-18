const db = require('../config/database');

function listEmployees(req, res) {
    try {
        const { search } = req.query;
        let rows;
        if (search) {
            const like = `%${search}%`;
            rows = db.prepare(
                `SELECT EmployeeID, ICNumber, EmployeeName, Department, Status FROM tblEmployees
                 WHERE EmployeeID LIKE ? OR ICNumber LIKE ? OR EmployeeName LIKE ?
                 ORDER BY EmployeeName`
            ).all(like, like, like);
        } else {
            rows = db.prepare(
                'SELECT EmployeeID, ICNumber, EmployeeName, Department, Status FROM tblEmployees ORDER BY EmployeeName'
            ).all();
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch employees', error: err.message });
    }
}

function getEmployee(req, res) {
    try {
        const row = db.prepare(
            'SELECT EmployeeID, ICNumber, EmployeeName, Department, Status FROM tblEmployees WHERE EmployeeID = ?'
        ).get(req.params.id);

        if (!row) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(row);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch employee', error: err.message });
    }
}

function createEmployee(req, res) {
    try {
        const { employeeId, icNumber, employeeName, department } = req.body;
        if (!employeeId || !employeeName) {
            return res.status(400).json({ message: 'employeeId and employeeName are required' });
        }

        db.prepare(
            'INSERT INTO tblEmployees (EmployeeID, ICNumber, EmployeeName, Department) VALUES (?, ?, ?, ?)'
        ).run(employeeId, icNumber || null, employeeName, department || null);

        res.status(201).json({ message: 'Employee created' });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'Employee ID already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Failed to create employee', error: err.message });
    }
}

module.exports = { listEmployees, getEmployee, createEmployee };
