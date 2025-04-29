const RubricEvaluation = require('../models/RubricEvaluation');
const Rubric = require('../models/Rubric');

// Get all evaluations
exports.getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await RubricEvaluation.find().populate('rubric_id');
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get evaluations by rubric ID
exports.getEvaluationsByRubricId = async (req, res) => {
  try {
    const evaluations = await RubricEvaluation.find({ rubric_id: req.params.rubricId });
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single evaluation
exports.getEvaluationById = async (req, res) => {
  try {
    const evaluation = await RubricEvaluation.findById(req.params.id).populate('rubric_id');
    if (!evaluation) {
      return res.status(404).json({ message: 'Không tìm thấy tiêu chí đánh giá' });
    }
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new evaluation
exports.createEvaluation = async (req, res) => {
  try {
    const evaluation = new RubricEvaluation(req.body);
    const savedEvaluation = await evaluation.save();

    // Add evaluation to rubric's evaluations array
    await Rubric.findByIdAndUpdate(
      req.body.rubric_id,
      { $push: { rubric_evaluations: savedEvaluation._id } }
    );

    res.status(201).json(savedEvaluation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update evaluation
exports.updateEvaluation = async (req, res) => {
  try {
    const evaluation = await RubricEvaluation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Không tìm thấy tiêu chí đánh giá' });
    }
    res.json(evaluation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete evaluation
exports.deleteEvaluation = async (req, res) => {
  try {
    const evaluation = await RubricEvaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Không tìm thấy tiêu chí đánh giá' });
    }

    // Remove evaluation from rubric's evaluations array
    await Rubric.findByIdAndUpdate(
      evaluation.rubric_id,
      { $pull: { rubric_evaluations: evaluation._id } }
    );

    await evaluation.remove();
    res.json({ message: 'Đã xóa tiêu chí đánh giá' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 