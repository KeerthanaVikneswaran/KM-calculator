const bcrypt = require('bcryptjs');
const db = require('./database');

const DEFAULT_USERS = [
    { username: 'admin', password: 'Admin@123', role: 'admin' },
    { username: 'user1', password: 'user1@123', role: 'portal1' },
    { username: 'user2', password: 'user2@123', role: 'portal2' }
];

async function seedDefaultUsers() {
    const created = [];
    const updated = [];

    for (const u of DEFAULT_USERS) {
        const existingByUsername = db.prepare('SELECT UserID FROM tblUsers WHERE Username = ?').get(u.username);
        if (existingByUsername) continue;

        const hash = await bcrypt.hash(u.password, 10);

        // A previous default account for this role (e.g. old "portal1" login)
        // gets renamed/repointed to the new credentials instead of creating
        // a duplicate account for the same role.
        const existingByRole = db.prepare('SELECT UserID FROM tblUsers WHERE Role = ?').get(u.role);
        if (existingByRole) {
            db.prepare('UPDATE tblUsers SET Username = ?, PasswordHash = ? WHERE UserID = ?')
                .run(u.username, hash, existingByRole.UserID);
            updated.push(u.username);
        } else {
            db.prepare('INSERT INTO tblUsers (Username, PasswordHash, Role) VALUES (?, ?, ?)').run(u.username, hash, u.role);
            created.push(u.username);
        }
    }

    return { created, updated };
}

module.exports = { seedDefaultUsers, DEFAULT_USERS };
