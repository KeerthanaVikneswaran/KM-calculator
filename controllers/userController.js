const bcrypt = require('bcryptjs');
const db = require('../config/database');

function listUsers(req, res) {
    try {
        const rows = db.prepare(`
            SELECT u.UserID, u.Username, u.Role, u.IsActive, u.BusID, b.BusNumber
            FROM tblUsers u
            LEFT JOIN tblBuses b ON b.BusID = u.BusID
            ORDER BY u.Role, u.Username
        `).all();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch users', error: err.message });
    }
}

async function createUser(req, res) {
    try {
        const { username, password, role, busNumber } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ message: 'username, password and role are required' });
        }
        if (!['admin', 'portal1', 'portal2'].includes(role)) {
            return res.status(400).json({ message: 'role must be admin, portal1 or portal2' });
        }

        let busId = null;
        if (busNumber) {
            const bus = db.prepare('SELECT BusID FROM tblBuses WHERE BusNumber = ?').get(busNumber);
            if (!bus) {
                return res.status(404).json({ message: `Bus ${busNumber} not found` });
            }
            busId = bus.BusID;
        }

        const hash = await bcrypt.hash(password, 10);

        db.prepare('INSERT INTO tblUsers (Username, PasswordHash, Role, BusID) VALUES (?, ?, ?, ?)')
            .run(username, hash, role, busId);

        res.status(201).json({ message: 'User created' });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'Username already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Failed to create user', error: err.message });
    }
}

module.exports = { listUsers, createUser };
