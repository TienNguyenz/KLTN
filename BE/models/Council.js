const mongoose = require('mongoose');

const councilSchema = new mongoose.Schema({
    assembly_name: {
        type: String,
        required: true,
        unique: true
    },
    assembly_major: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major'
    },
    chairman: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    secretary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'assemblies'
});

module.exports = mongoose.model('Council', councilSchema); 