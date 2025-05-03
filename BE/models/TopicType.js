const mongoose = require('mongoose');

const topicTypeSchema = new mongoose.Schema({
    topic_category_title: { type: String, required: true },
    topic_category_description: String
}, { timestamps: true, collection: 'TopicCategory' });

module.exports = mongoose.model('TopicType', topicTypeSchema); 