require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { seedDefaultUsers } = require('./config/seed');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const busRoutes = require('./routes/busRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/buses', busRoutes);
app.use('/api', transactionRoutes);

app.use('/shared', express.static(path.join(__dirname, 'public/shared')));
app.use('/portal1', express.static(path.join(__dirname, 'public/portal1')));
app.use('/portal2', express.static(path.join(__dirname, 'public/portal2')));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/', express.static(path.join(__dirname, 'public/login')));

app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

const PORT = process.env.PORT || 3000;

seedDefaultUsers()
    .then(({ created, updated }) => {
        if (created.length) console.log('Seeded default logins:', created.join(', '));
        if (updated.length) console.log('Updated default logins:', updated.join(', '));
    })
    .catch((err) => console.error('Auto-seed failed:', err.message))
    .finally(() => {
        app.listen(PORT, () => {
            console.log(`Bus KM System running on http://localhost:${PORT}`);
        });
    });
