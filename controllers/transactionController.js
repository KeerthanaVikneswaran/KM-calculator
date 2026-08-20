const db = require('../config/database');

function toDateOnly(dateStr) {
    return new Date(dateStr).toISOString().slice(0, 10);
}

/* ---------------------------------------------------------
   POST /api/bus-entry  (Portal 1)
   Body: { employeeId, busId, travelDate }
   --------------------------------------------------------- */
function createBusEntry(req, res) {
    const { employeeId, busId, travelDate } = req.body;
    const scannedBy = req.user ? req.user.username : null;

    if (!employeeId || !busId || !travelDate) {
        return res.status(400).json({ message: 'employeeId, busId and travelDate are required' });
    }

    try {
        const employee = db.prepare('SELECT EmployeeID, EmployeeName, ICNumber FROM tblEmployees WHERE EmployeeID = ?').get(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        const bus = db.prepare('SELECT BusID, BusNumber FROM tblBuses WHERE BusID = ?').get(busId);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        const date = toDateOnly(travelDate);

        const save = db.transaction(() => {
            const existing = db.prepare('SELECT ID, KM FROM tblBusEmployee WHERE EmployeeID = ? AND TravelDate = ?').get(employeeId, date);

            if (existing) {
                const status = existing.KM !== null ? 'Completed' : 'KM Pending';
                db.prepare(
                    "UPDATE tblBusEmployee SET BusID = ?, Status = ?, ScannedBy = ?, ScannedAt = datetime('now'), UpdatedDate = datetime('now') WHERE ID = ?"
                ).run(busId, status, scannedBy, existing.ID);
                return existing.ID;
            }

            const info = db.prepare(
                "INSERT INTO tblBusEmployee (EmployeeID, BusID, TravelDate, KM, Status, ScannedBy, ScannedAt) VALUES (?, ?, ?, NULL, 'KM Pending', ?, datetime('now'))"
            ).run(employeeId, busId, date, scannedBy);
            return info.lastInsertRowid;
        });

        const id = save();
        const row = db.prepare('SELECT * FROM tblBusEmployee WHERE ID = ?').get(id);

        res.status(200).json({
            message: 'Bus entry saved',
            transaction: { ...row, EmployeeName: employee.EmployeeName, BusNumber: bus.BusNumber }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save bus entry', error: err.message });
    }
}

/* ---------------------------------------------------------
   POST /api/km-entry  (Portal 2)
   Body: { employeeId, travelDate, km }
   --------------------------------------------------------- */
function createKmEntry(req, res) {
    const { employeeId, travelDate, km } = req.body;
    const kmEnteredBy = req.user ? req.user.username : null;

    if (!employeeId || !travelDate || km === undefined || km === null || km === '') {
        return res.status(400).json({ message: 'employeeId, travelDate and km are required' });
    }
    if (isNaN(km) || Number(km) < 0) {
        return res.status(400).json({ message: 'km must be a positive number' });
    }

    try {
        const employee = db.prepare('SELECT EmployeeID, EmployeeName, ICNumber FROM tblEmployees WHERE EmployeeID = ?').get(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const date = toDateOnly(travelDate);
        const kmValue = Number(km);

        const save = db.transaction(() => {
            const existing = db.prepare('SELECT ID, BusID FROM tblBusEmployee WHERE EmployeeID = ? AND TravelDate = ?').get(employeeId, date);

            if (existing) {
                const status = existing.BusID !== null ? 'Completed' : 'Bus Pending';
                db.prepare(
                    "UPDATE tblBusEmployee SET KM = ?, Status = ?, KmEnteredBy = ?, KmEnteredAt = datetime('now'), UpdatedDate = datetime('now') WHERE ID = ?"
                ).run(kmValue, status, kmEnteredBy, existing.ID);
                return existing.ID;
            }

            const info = db.prepare(
                "INSERT INTO tblBusEmployee (EmployeeID, BusID, TravelDate, KM, Status, KmEnteredBy, KmEnteredAt) VALUES (?, NULL, ?, ?, 'Bus Pending', ?, datetime('now'))"
            ).run(employeeId, date, kmValue, kmEnteredBy);
            return info.lastInsertRowid;
        });

        const id = save();
        const row = db.prepare('SELECT * FROM tblBusEmployee WHERE ID = ?').get(id);

        let busNumber = null;
        if (row.BusID) {
            const bus = db.prepare('SELECT BusNumber FROM tblBuses WHERE BusID = ?').get(row.BusID);
            busNumber = bus ? bus.BusNumber : null;
        }

        res.status(200).json({
            message: 'KM entry saved',
            transaction: { ...row, EmployeeName: employee.EmployeeName, BusNumber: busNumber }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save KM entry', error: err.message });
    }
}

/* ---------------------------------------------------------
   GET /api/transactions?date=&busId=&employeeId=&status=
   --------------------------------------------------------- */
function listTransactions(req, res) {
    try {
        const { date, busId, employeeId, status } = req.query;

        let query = `
            SELECT t.ID, t.EmployeeID, e.EmployeeName, e.ICNumber, t.BusID, b.BusNumber,
                   t.TravelDate, t.KM, t.Status, t.CreatedDate, t.UpdatedDate,
                   t.ScannedBy, t.ScannedAt, t.KmEnteredBy, t.KmEnteredAt
            FROM tblBusEmployee t
            JOIN tblEmployees e ON e.EmployeeID = t.EmployeeID
            LEFT JOIN tblBuses b ON b.BusID = t.BusID
            WHERE 1 = 1
        `;
        const params = [];

        if (date) {
            query += ' AND t.TravelDate = ?';
            params.push(toDateOnly(date));
        }
        if (busId) {
            query += ' AND t.BusID = ?';
            params.push(busId);
        }
        if (employeeId) {
            query += ' AND t.EmployeeID = ?';
            params.push(employeeId);
        }
        if (status) {
            query += ' AND t.Status = ?';
            params.push(status);
        }

        query += ' ORDER BY t.TravelDate DESC, t.UpdatedDate DESC';

        const rows = db.prepare(query).all(...params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
    }
}

/* ---------------------------------------------------------
   GET /api/dashboard?date=
   --------------------------------------------------------- */
function getDashboard(req, res) {
    try {
        const date = req.query.date ? toDateOnly(req.query.date) : toDateOnly(new Date());

        const row = db.prepare(`
            SELECT
                COUNT(*) AS TotalEmployees,
                COUNT(DISTINCT BusID) AS TotalBuses,
                SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS Completed,
                SUM(CASE WHEN Status <> 'Completed' THEN 1 ELSE 0 END) AS Pending,
                COALESCE(SUM(KM), 0) AS TotalKM
            FROM tblBusEmployee
            WHERE TravelDate = ?
        `).get(date);

        res.json({ date, ...row });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
    }
}

module.exports = { createBusEntry, createKmEntry, listTransactions, getDashboard };
