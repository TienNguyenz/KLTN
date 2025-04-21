const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Route để xem tất cả collections
router.get('/collections', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        res.json(collectionNames);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route để xem dữ liệu của một collection cụ thể
router.get('/collections/:name', async (req, res) => {
    try {
        const collectionName = req.params.name;
        const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 