const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { listUsers, createUser } = require('../controllers/userController');

router.get('/', authenticate, authorize('admin'), listUsers);
router.post('/', authenticate, authorize('admin'), createUser);

module.exports = router;
