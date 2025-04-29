const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    semester: {
        type: String,
        required: true,
        unique: true
    },
    school_year_start: {
        type: Date,
        required: true
    },
    school_year_end: {
        type: Date,
        required: true
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
    collection: 'semesters'
});

module.exports = mongoose.model('Semester', semesterSchema); 