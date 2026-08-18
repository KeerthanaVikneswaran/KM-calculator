const bcrypt = require('bcryptjs');
const db = require('./database');

const DEFAULT_USERS = [
    { username: 'admin', password: 'Admin@123', role: 'admin' },
    { username: 'portal1', password: 'Portal1@123', role: 'portal1' },
    { username: 'portal2', password: 'Portal2@123', role: 'portal2' }
];

async function seedDefaultUsers() {
    const created = [];

    for (const u of DEFAULT_USERS) {
        const existing = db.prepare('SELECT UserID FROM tblUsers WHERE Username = ?').get(u.username);
        if (existing) continue;

        const hash = await bcrypt.hash(u.password, 10);
        db.prepare('INSERT INTO tblUsers (Username, PasswordHash, Role) VALUES (?, ?, ?)').run(u.username, hash, u.role);
        created.push(u.username);
    }

    return created;
}

module.exports = { seedDefaultUsers, DEFAULT_USERS };
