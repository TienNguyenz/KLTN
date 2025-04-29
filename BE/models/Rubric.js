const mongoose = require('mongoose');

const rubricSchema = new mongoose.Schema({
  rubric_name: {
    type: String,
    required: true
  },
  rubric_category: {
    type: Number,
    required: true
  },
  rubric_topic_category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rubric_evaluations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RubricEvaluation'
  }],
  rubric_note: {
    type: String
  },
  rubric_template: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rubric', rubricSchema); 