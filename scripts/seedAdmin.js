/* Run once after installing dependencies:  node scripts/seedAdmin.js
   Creates default logins (admin/Admin@123, user1/user1@123, user2/user2@123).
   Not required before `npm start` — the server also auto-seeds these on first boot
   if tblUsers is empty (see config/seed.js), which is what makes a fresh deploy
   (e.g. on Render) work without needing shell access to run this manually.
*/
require('dotenv').config();
const { seedDefaultUsers, DEFAULT_USERS } = require('../config/seed');

seedDefaultUsers()
    .then(({ created, updated }) => {
        DEFAULT_USERS.forEach((u) => {
            if (created.includes(u.username)) {
                console.log(`Created: ${u.username} / ${u.password} (${u.role})`);
            } else if (updated.includes(u.username)) {
                console.log(`Updated: ${u.username} / ${u.password} (${u.role})`);
            } else {
                console.log(`Skipped (already exists): ${u.username}`);
            }
        });
        process.exit(0);
    })
    .catch((err) => {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    });
