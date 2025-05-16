// Council Schema: Quản lý hội đồng
const mongoose = require('mongoose');

const councilSchema = new mongoose.Schema({
    assembly_name: {
        type: String,
        required: [true, 'Tên hội đồng là bắt buộc'],
        unique: true,
        trim: true
    },
    assembly_major: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major',
        required: [true, 'Chuyên ngành là bắt buộc']
    },
    chairman: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Chủ tịch hội đồng là bắt buộc']
    },
    secretary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Thư ký hội đồng là bắt buộc']
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Thành viên hội đồng là bắt buộc']
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
    timestamps: true,
    collection: 'assemblies'
});

module.exports = mongoose.model('Council', councilSchema); 