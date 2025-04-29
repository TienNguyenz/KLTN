const express = require('express');
const router = express.Router();
const registrationPeriodController = require('../controllers/registrationPeriodController');
const { auth, checkRole } = require('../middleware/auth');

// Public routes
router.get('/', registrationPeriodController.getAllRegistrationPeriods);
router.get('/:id', registrationPeriodController.getRegistrationPeriodById);

// Protected routes (admin only)
router.post('/', auth, checkRole(['admin']), registrationPeriodController.createRegistrationPeriod);
router.put('/:id', auth, checkRole(['admin']), registrationPeriodController.updateRegistrationPeriod);
router.delete('/:id', auth, checkRole(['admin']), registrationPeriodController.deleteRegistrationPeriod);

module.exports = router; 