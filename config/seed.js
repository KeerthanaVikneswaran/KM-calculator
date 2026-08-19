const bcrypt = require('bcryptjs');
const db = require('./database');

const DEFAULT_USERS = [
    { username: 'admin', password: 'Admin@123', role: 'admin' },

    { username: 'user1', password: 'user1@123', role: 'portal1', busNumber: 'BUS-001' },
    { username: 'user2', password: 'user2@123', role: 'portal1', busNumber: 'BUS-002' },
    { username: 'user3', password: 'user3@123', role: 'portal1', busNumber: 'BUS-003' },
    { username: 'user4', password: 'user4@123', role: 'portal1', busNumber: 'BUS-004' },
    { username: 'user5', password: 'user5@123', role: 'portal1', busNumber: 'BUS-005' },

    { username: 'user6', password: 'user6@123', role: 'portal2', busNumber: 'BUS-001' },
    { username: 'user7', password: 'user7@123', role: 'portal2', busNumber: 'BUS-002' },
    { username: 'user8', password: 'user8@123', role: 'portal2', busNumber: 'BUS-003' },
    { username: 'user9', password: 'user9@123', role: 'portal2', busNumber: 'BUS-004' },
    { username: 'user10', password: 'user10@123', role: 'portal2', busNumber: 'BUS-005' }
];

// Every boot, each account above is force-synced (password/role/bus) to
// match this list - this is the only place logins are managed, so it's
// safe to treat this file as the single source of truth on every restart.
async function seedDefaultUsers() {
    const created = [];
    const updated = [];

    for (const u of DEFAULT_USERS) {
        const bus = u.busNumber ? db.prepare('SELECT BusID FROM tblBuses WHERE BusNumber = ?').get(u.busNumber) : null;
        const busId = bus ? bus.BusID : null;
        const hash = await bcrypt.hash(u.password, 10);

        const existing = db.prepare('SELECT UserID FROM tblUsers WHERE Username = ?').get(u.username);

        if (existing) {
            db.prepare('UPDATE tblUsers SET PasswordHash = ?, Role = ?, BusID = ? WHERE UserID = ?')
                .run(hash, u.role, busId, existing.UserID);
            updated.push(u.username);
        } else {
            db.prepare('INSERT INTO tblUsers (Username, PasswordHash, Role, BusID) VALUES (?, ?, ?, ?)')
                .run(u.username, hash, u.role, busId);
            created.push(u.username);
        }
    }

    return { created, updated };
}

module.exports = { seedDefaultUsers, DEFAULT_USERS };
