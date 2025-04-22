const express = require('express');
const router = express.Router();
const councilController = require('../controllers/councilController');

// Get all councils
router.get('/', councilController.getAllCouncils);

// Create new council
router.post('/', councilController.createCouncil);

// Update council
router.put('/:id', councilController.updateCouncil);

// Delete council
router.delete('/:id', councilController.deleteCouncil);

module.exports = router; 