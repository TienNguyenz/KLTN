// Major Schema: Quản lý chuyên ngành
const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema({
    major_title: {
        type: String,
        required: [true, 'Tên chuyên ngành là bắt buộc'],
        unique: true,
        trim: true
    },
    major_faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: [true, 'Khoa là bắt buộc']
    }
}, {
    collection: 'majors'
});

module.exports = mongoose.model('Major', majorSchema); 