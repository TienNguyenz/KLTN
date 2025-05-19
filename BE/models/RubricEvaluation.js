// RubricEvaluation Schema: Quản lý tiêu chí đánh giá rubric
const mongoose = require('mongoose');

const rubricEvaluationSchema = new mongoose.Schema({
  rubric_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rubric',
    required: [true, 'Rubric là bắt buộc']
  },
  serial: {
    type: Number,
    required: [true, 'STT là bắt buộc'],
    min: [1, 'STT phải >= 1']
  },
  evaluation_criteria: {
    type: String,
    required: [true, 'Tiêu chí đánh giá là bắt buộc'],
    trim: true
  },
  grading_scale: {
    type: Number,
    required: [true, 'Thang điểm là bắt buộc'],
    min: [1, 'Thang điểm phải >= 1'],
    max: [10, 'Thang điểm tối đa là 10']
  },
  weight: {
    type: Number,
    required: [true, 'Trọng số là bắt buộc'],
    min: [0, 'Trọng số phải >= 0'],
    max: [1, 'Trọng số tối đa là 1']
  },
  level_core: {
    type: String,
    // required: [true, 'Mức độ lõi là bắt buộc'],
    trim: true
  },
  note: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RubricEvaluation', rubricEvaluationSchema); 