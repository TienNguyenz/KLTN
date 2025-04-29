const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semesterController');

// Get all semesters
router.get('/', semesterController.getAllSemesters);

// Create new semester
router.post('/', semesterController.createSemester);

// Update semester
router.put('/:id', semesterController.updateSemester);

// Delete semester
router.delete('/:id', semesterController.deleteSemester);

module.exports = router; 