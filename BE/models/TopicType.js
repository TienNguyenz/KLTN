// TopicType Schema: Quản lý loại đề tài
const mongoose = require('mongoose');

const topicTypeSchema = new mongoose.Schema({
    topic_category_title: {
        type: String,
        required: [true, 'Tên loại đề tài là bắt buộc'],
        unique: true,
        trim: true
    },
    topic_category_description: {
        type: String,
        trim: true
    }
}, { timestamps: true, collection: 'TopicCategory' });

module.exports = mongoose.model('TopicType', topicTypeSchema); 