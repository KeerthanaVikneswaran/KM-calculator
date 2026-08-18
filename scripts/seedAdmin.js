/* Run once after installing dependencies:  node scripts/seedAdmin.js
   Creates default logins (admin/Admin@123, portal1/Portal1@123, portal2/Portal2@123).
   Not required before `npm start` — the server also auto-seeds these on first boot
   if tblUsers is empty (see config/seed.js), which is what makes a fresh deploy
   (e.g. on Render) work without needing shell access to run this manually.
*/
require('dotenv').config();
const { seedDefaultUsers, DEFAULT_USERS } = require('../config/seed');

seedDefaultUsers()
    .then((created) => {
        DEFAULT_USERS.forEach((u) => {
            if (created.includes(u.username)) {
                console.log(`Created: ${u.username} / ${u.password} (${u.role})`);
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
