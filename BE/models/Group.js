const mongoose = require('mongoose');

// Group Schema: Quản lý nhóm sinh viên thực hiện đề tài
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên nhóm là bắt buộc'],
        trim: true
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: [true, 'Đề tài là bắt buộc']
    },
    members: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Thành viên là bắt buộc']
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
        name: {
            type: String,
            trim: true
        },
        url: {
            type: String,
            trim: true
        },
        type: {
            type: String,
            trim: true
        },
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
            required: [true, 'Người đánh giá là bắt buộc']
        },
        scores: [{
            criteria: {
                type: String,
                trim: true
            },
            score: Number,
            weight: Number,
            comment: {
                type: String,
                trim: true
            }
        }],
        totalScore: Number,
        comment: {
            type: String,
            trim: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Group', groupSchema); 