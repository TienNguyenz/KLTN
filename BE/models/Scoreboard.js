const mongoose = require('mongoose');

const scoreboardSchema = new mongoose.Schema({
  rubric_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rubric',
    required: true
  },
  rubric_category: {
    type: Number
  },
  topic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  grader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rubric_student_evaluations: [
    {
      evaluation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RubricEvaluation' },
      score: Number
    }
  ],
  total_score: Number,
  student_grades: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('Scoreboard', scoreboardSchema); 