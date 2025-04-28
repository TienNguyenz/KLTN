const express = require('express');
const router = express.Router();
const councilController = require('../controllers/councilController');

// Get all councils
router.get('/database/collections/assemblies', councilController.getAllCouncils);

// Create new council
router.post('/database/collections/assemblies', (req, res) => {
    if (req.query.action === 'insert') {
        councilController.createCouncil(req, res);
    } else if (req.query.action === 'update') {
        councilController.updateCouncil(req, res);
    } else if (req.query.action === 'delete') {
        councilController.deleteCouncil(req, res);
    } else {
        councilController.createCouncil(req, res); // Mặc định là tạo mới nếu không có action
    }
});

// Update council
router.put('/database/collections/assemblies/:id', (req, res) => {
    req.params.id = req.params.id;
    councilController.updateCouncil(req, res);
});

// Delete council
router.delete('/database/collections/assemblies/:id', (req, res) => {
    req.params.id = req.params.id;
    councilController.deleteCouncil(req, res);
});

module.exports = router; 