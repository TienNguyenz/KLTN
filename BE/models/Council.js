const mongoose = require('mongoose');

const councilSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    chairman: {
        type: String,
        required: true
    },
    secretary: {
        type: String,
        required: true
    },
    members: [{
        type: String,
        required: true
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Council', councilSchema); 