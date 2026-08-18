const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
    createBusEntry,
    createKmEntry,
    listTransactions,
    getDashboard
} = require('../controllers/transactionController');

router.post('/bus-entry', authenticate, authorize('admin', 'portal1'), createBusEntry);
router.post('/km-entry', authenticate, authorize('admin', 'portal2'), createKmEntry);
router.get('/transactions', authenticate, listTransactions);
router.get('/dashboard', authenticate, authorize('admin'), getDashboard);

module.exports = router;
