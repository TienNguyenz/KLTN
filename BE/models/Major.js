const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema({
    major_title: {
        type: String,
        required: true
    },
    major_faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    }
}, {
    collection: 'majors'
});

module.exports = mongoose.model('Major', majorSchema); 