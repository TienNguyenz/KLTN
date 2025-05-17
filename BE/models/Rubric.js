// Rubric Schema: Quản lý rubric đánh giá
const mongoose = require('mongoose');

const rubricSchema = new mongoose.Schema({
  rubric_name: {
    type: String,
    required: [true, 'Tên rubric là bắt buộc'],
    unique: true,
    trim: true
  },
  rubric_category: {
    type: Number,
    required: [true, 'Loại rubric là bắt buộc']
  },
  rubric_topic_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TopicType',
    required: [true, 'Loại đề tài là bắt buộc']
  },
  rubric_evaluations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RubricEvaluation'
  }],
  rubric_note: {
    type: String,
    trim: true
  },
  rubric_template: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rubric', rubricSchema); 