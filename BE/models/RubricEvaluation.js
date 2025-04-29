const mongoose = require('mongoose');

const rubricEvaluationSchema = new mongoose.Schema({
  rubric_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rubric',
    required: true
  },
  serial: {
    type: Number,
    required: true
  },
  evaluation_criteria: {
    type: String,
    required: true
  },
  grading_scale: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  level_core: {
    type: String,
    required: true
  },
  note: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RubricEvaluation', rubricEvaluationSchema); 