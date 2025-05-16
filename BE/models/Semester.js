// Semester Schema: Quản lý học kỳ
const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    semester: {
        type: String,
        required: [true, 'Tên học kỳ là bắt buộc'],
        unique: true,
        trim: true
    },
    school_year_start: {
        type: Date,
        required: [true, 'Ngày bắt đầu năm học là bắt buộc']
    },
    school_year_end: {
        type: Date,
        required: [true, 'Ngày kết thúc năm học là bắt buộc']
    },
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
    collection: 'semesters'
});

module.exports = mongoose.model('Semester', semesterSchema); 