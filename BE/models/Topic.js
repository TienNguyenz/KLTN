const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    topic_registration_period: String,
    topic_title: String,
    topic_description: String,
    topic_category: { type: mongoose.Schema.Types.ObjectId, ref: 'TopicType' },
    topic_major: { type: mongoose.Schema.Types.ObjectId, ref: 'Major' },
    topic_creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    topic_max_members: Number,
    topic_group_student: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    topic_instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    topic_reviewer: String,
    topic_teacher_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    topic_leader_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    topic_advisor_request: String,
    topic_final_report: String,
    topic_outline_file_original_name: String,
    topic_final_report_original_name: String,
    topic_defense_request: String,
    rubric_instructor: String,
    rubric_reviewer: String,
    topic_assembly: String,
    topic_room: String,
    topic_time_start: String,
    topic_time_end: String,
    topic_date: String,
    topic_block: Boolean
}, { timestamps: true, collection: 'Topic' });

module.exports = mongoose.model('Topic', topicSchema); 