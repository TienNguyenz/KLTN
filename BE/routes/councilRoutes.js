/* eslint-disable no-undef */
// Route: Hội đồng (Council)
const express = require('express');
const router = express.Router();
const councilController = require('../controllers/councilController');

// Lấy tất cả hội đồng
router.get('/database/collections/assemblies', councilController.getAllCouncils);

// Tạo hội đồng mới
router.post('/database/collections/assemblies', councilController.createCouncil);

// Cập nhật hội đồng
router.put('/database/collections/assemblies/:id', councilController.updateCouncil);

// Xóa hội đồng
router.delete('/database/collections/assemblies/:id', councilController.deleteCouncil);

module.exports = router; 