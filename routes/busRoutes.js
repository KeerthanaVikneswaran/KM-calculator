const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { listBuses, createBus } = require('../controllers/busController');

router.get('/', authenticate, listBuses);
router.post('/', authenticate, authorize('admin'), createBus);

module.exports = router;
