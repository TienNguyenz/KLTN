const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    topic_registration_period: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RegistrationPeriod',
        required: [true, 'Đợt đăng ký là bắt buộc']
    },
    topic_title: {
        type: String,
        required: [true, 'Tên đề tài là bắt buộc'],
        trim: true
    },
    topic_description: {
        type: String,
        trim: true
    },
    topic_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TopicType',
        required: [true, 'Loại đề tài là bắt buộc']
    },
    topic_major: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major',
        required: [true, 'Chuyên ngành là bắt buộc']
    },
    topic_creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Người tạo là bắt buộc']
    },
    topic_max_members: {
        type: Number,
        min: [1, 'Số lượng thành viên tối thiểu là 1'],
        max: [10, 'Số lượng thành viên tối đa là 10']
    },
    topic_group_student: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    topic_instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    topic_reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    topic_teacher_status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    topic_leader_status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    topic_advisor_request: {
        type: String,
        trim: true
    },
    topic_final_report: {
        type: String,
        trim: true
    },
    topic_outline_file_original_name: {
        type: String,
        trim: true
    },
    topic_final_report_original_name: {
        type: String,
        trim: true
    },
    topic_defense_request: {
        type: String,
        trim: true
    },
    rubric_instructor: {
        type: String,
        trim: true
    },
    rubric_reviewer: {
        type: String,
        trim: true
    },
    topic_assembly: {
        type: String,
        trim: true
    },
    topic_room: {
        type: String,
        trim: true
    },
    topic_time_start: {
        type: String,
        trim: true
    },
    topic_time_end: {
        type: String,
        trim: true
    },
    topic_date: {
        type: String,
        trim: true
    },
    topic_block: {
        type: Boolean,
        default: false
    }
}, { timestamps: true, collection: 'Topic' });

module.exports = mongoose.model('Topic', topicSchema); 