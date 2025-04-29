const Rubric = require('../models/Rubric');
const RubricEvaluation = require('../models/RubricEvaluation');

// Get all rubrics
exports.getAllRubrics = async (req, res) => {
  try {
    const rubrics = await Rubric.find().populate('rubric_evaluations');
    res.json(rubrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single rubric
exports.getRubricById = async (req, res) => {
  try {
    const rubric = await Rubric.findById(req.params.id).populate('rubric_evaluations');
    if (!rubric) {
      return res.status(404).json({ message: 'Không tìm thấy rubric' });
    }
    res.json(rubric);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new rubric
exports.createRubric = async (req, res) => {
  try {
    const rubric = new Rubric(req.body);
    const savedRubric = await rubric.save();
    res.status(201).json(savedRubric);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update rubric
exports.updateRubric = async (req, res) => {
  try {
    const rubric = await Rubric.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('rubric_evaluations');
    
    if (!rubric) {
      return res.status(404).json({ message: 'Không tìm thấy rubric' });
    }
    res.json(rubric);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete rubric
exports.deleteRubric = async (req, res) => {
  try {
    const rubric = await Rubric.findById(req.params.id);
    if (!rubric) {
      return res.status(404).json({ message: 'Không tìm thấy rubric' });
    }

    // Delete associated evaluations
    await RubricEvaluation.deleteMany({ rubric_id: rubric._id });
    
    await rubric.remove();
    res.json({ message: 'Đã xóa rubric' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 