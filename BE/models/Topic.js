const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['supervised', 'review', 'committee'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed'],
        default: 'pending'
    },
    maxStudents: {
        type: Number,
        required: true,
        default: 1
    },
    department: {
        type: String,
        required: true
    },
    documents: [{
        name: String,
        url: String,
        type: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        submittedAt: Date
    }],
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Topic', topicSchema); 