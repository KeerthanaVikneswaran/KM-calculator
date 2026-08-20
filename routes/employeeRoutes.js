const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { listEmployees, getEmployee, createEmployee } = require('../controllers/employeeController');

router.get('/', authenticate, listEmployees);
router.get('/:id', authenticate, getEmployee);
router.post('/', authenticate, authorize('admin', 'portal1'), createEmployee);

module.exports = router;
