// Faculty Schema: Quản lý khoa
const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    faculty_name: {
        type: String,
        required: [true, 'Tên khoa là bắt buộc'],
        unique: true,
        trim: true
    },
    faculty_description: {
        type: String,
        trim: true
    }
}, {
    collection: 'faculties'
});

module.exports = mongoose.model('Faculty', facultySchema); 