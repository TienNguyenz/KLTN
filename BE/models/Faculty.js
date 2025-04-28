const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    faculty_name: {
        type: String,
        required: true
    },
    faculty_description: {
        type: String
    }
}, {
    collection: 'faculties'
});

module.exports = mongoose.model('Faculty', facultySchema); 