const db = require('../config/database');

function listBuses(req, res) {
    try {
        const rows = db.prepare(
            "SELECT BusID, BusNumber, BusName, Status FROM tblBuses WHERE Status = 'Active' ORDER BY BusNumber"
        ).all();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch buses', error: err.message });
    }
}

function createBus(req, res) {
    try {
        const { busNumber, busName } = req.body;
        if (!busNumber) {
            return res.status(400).json({ message: 'busNumber is required' });
        }

        db.prepare('INSERT INTO tblBuses (BusNumber, BusName) VALUES (?, ?)').run(busNumber, busName || null);

        res.status(201).json({ message: 'Bus created' });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'Bus number already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Failed to create bus', error: err.message });
    }
}

module.exports = { listBuses, createBus };
