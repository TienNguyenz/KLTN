const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    members: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['leader', 'member'],
            default: 'member'
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed'],
        default: 'pending'
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
    evaluations: [{
        evaluator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        scores: [{
            criteria: String,
            score: Number,
            weight: Number,
            comment: String
        }],
        totalScore: Number,
        comment: String,
        submittedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Group', groupSchema); 