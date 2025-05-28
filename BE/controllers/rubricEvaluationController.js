/* eslint-disable no-undef */
const RubricEvaluation = require('../models/RubricEvaluation');
const Rubric = require('../models/Rubric');
const mongoose = require('mongoose');

// Constants
const ERROR_MESSAGES = {
  EVALUATION_NOT_FOUND: 'Không tìm thấy tiêu chí đánh giá',
  RUBRIC_NOT_FOUND: 'Không tìm thấy rubric',
  SERVER_ERROR: 'Lỗi máy chủ',
  INVALID_DATA: 'Dữ liệu không hợp lệ',
  DELETE_SUCCESS: 'Đã xóa tiêu chí đánh giá'
};

// Helper functions
const handleError = (error, customMessage) => {
  console.error(customMessage, error);
  return {
    message: ERROR_MESSAGES.SERVER_ERROR,
    error: error.message
  };
};

const validateEvaluationData = (data) => {
  const { rubric_id, evaluation_criteria, grading_scale } = data;
  
  if (!rubric_id) {
    return { isValid: false, message: 'Vui lòng chọn rubric' };
  }
  
  if (!evaluation_criteria || !evaluation_criteria.trim()) {
    return { isValid: false, message: 'Vui lòng nhập tiêu chí đánh giá' };
  }
  
  if (
    grading_scale === undefined ||
    grading_scale === null ||
    isNaN(grading_scale) ||
    grading_scale < 1 ||
    grading_scale > 10
  ) {
    return { isValid: false, message: 'Thang điểm phải từ 1 đến 10' };
  }
  
  return { isValid: true };
};

/**
 * Lấy tất cả tiêu chí đánh giá
 * @route GET /api/rubric-evaluations
 */
exports.getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await RubricEvaluation.find()
      .populate('rubric_id')
      .sort({ createdAt: -1 });
    return res.status(200).json(evaluations);
  } catch (error) {
    const errorResponse = handleError(error, 'Lỗi khi lấy danh sách tiêu chí đánh giá:');
    return res.status(500).json(errorResponse);
  }
};

/**
 * Lấy tiêu chí đánh giá theo rubric ID
 * @route GET /api/rubric-evaluations/rubric/:rubricId
 */
exports.getEvaluationsByRubricId = async (req, res) => {
  try {
    const rubric = await Rubric.findById(req.params.rubricId);
    if (!rubric) {
      return res.status(404).json({ message: ERROR_MESSAGES.RUBRIC_NOT_FOUND });
    }
    // So sánh rubric_id dưới dạng ObjectId
    const evaluations = await RubricEvaluation.find({ rubric_id: new mongoose.Types.ObjectId(req.params.rubricId) })
      .sort({ createdAt: -1 });
    return res.status(200).json(evaluations);
  } catch (error) {
    const errorResponse = handleError(error, 'Lỗi khi lấy tiêu chí đánh giá theo rubric:');
    return res.status(500).json(errorResponse);
  }
};

/**
 * Lấy thông tin một tiêu chí đánh giá
 * @route GET /api/rubric-evaluations/:id
 */
exports.getEvaluationById = async (req, res) => {
  try {
    const evaluation = await RubricEvaluation.findById(req.params.id)
      .populate('rubric_id');
    
    if (!evaluation) {
      return res.status(404).json({ message: ERROR_MESSAGES.EVALUATION_NOT_FOUND });
    }
    
    return res.status(200).json(evaluation);
  } catch (error) {
    const errorResponse = handleError(error, 'Lỗi khi lấy thông tin tiêu chí đánh giá:');
    return res.status(500).json(errorResponse);
  }
};

/**
 * Tạo tiêu chí đánh giá mới
 * @route POST /api/rubric-evaluations
 */
exports.createEvaluation = async (req, res) => {
  try {
    // Validate input data
    const validation = validateEvaluationData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    // Check if rubric exists
    const rubric = await Rubric.findById(req.body.rubric_id);
    if (!rubric) {
      return res.status(404).json({ message: ERROR_MESSAGES.RUBRIC_NOT_FOUND });
    }

    // Kiểm tra tên tiêu chí không trùng trong cùng rubric
    const existingNames = await RubricEvaluation.find({
      rubric_id: req.body.rubric_id,
      evaluation_criteria: req.body.evaluation_criteria
    });
    if (existingNames.length > 0) {
      return res.status(400).json({ message: 'Tên tiêu chí đã tồn tại trong phiếu đánh giá này.' });
    }

    // Kiểm tra tổng trọng số các tiêu chí (bao gồm tiêu chí mới) phải đúng 1
    const allEvaluations = await RubricEvaluation.find({ rubric_id: req.body.rubric_id });
    let totalWeight = req.body.weight;
    allEvaluations.forEach(e => { totalWeight += e.weight; });
    // Làm tròn 2 chữ số thập phân để tránh lỗi số thực
    const roundedTotal = Math.round(totalWeight * 100) / 100;
    if (roundedTotal > 1) {
      return res.status(400).json({ message: 'Tổng trọng số các tiêu chí vượt quá 100%.' });
    }
    // Nếu là tiêu chí cuối cùng, tổng phải đúng 1 (có thể truyền flag từ FE nếu muốn kiểm tra chặt hơn)
    if (Math.abs(roundedTotal - 1) > 0.01 && req.body.isLast) {
      return res.status(400).json({ message: 'Tổng trọng số các tiêu chí phải đúng 100%.' });
    }

    const evaluation = new RubricEvaluation(req.body);
    const savedEvaluation = await evaluation.save();

    // Add evaluation to rubric's evaluations array
    await Rubric.findByIdAndUpdate(
      req.body.rubric_id,
      { $push: { rubric_evaluations: savedEvaluation._id } }
    );

    return res.status(201).json(savedEvaluation);
  } catch (error) {
    const errorResponse = handleError(error, 'Lỗi khi tạo tiêu chí đánh giá mới:');
    return res.status(500).json(errorResponse);
  }
};

/**
 * Cập nhật tiêu chí đánh giá
 * @route PUT /api/rubric-evaluations/:id
 */
exports.updateEvaluation = async (req, res) => {
  try {
    // Validate input data
    const validation = validateEvaluationData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const evaluation = await RubricEvaluation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('rubric_id');
    
    if (!evaluation) {
      return res.status(404).json({ message: ERROR_MESSAGES.EVALUATION_NOT_FOUND });
    }

    return res.status(200).json(evaluation);
  } catch (error) {
    const errorResponse = handleError(error, 'Lỗi khi cập nhật tiêu chí đánh giá:');
    return res.status(500).json(errorResponse);
  }
};

/**
 * Xóa tiêu chí đánh giá
 * @route DELETE /api/rubric-evaluations/:id
 */
exports.deleteEvaluation = async (req, res) => {
  try {
    const evaluation = await RubricEvaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: ERROR_MESSAGES.EVALUATION_NOT_FOUND });
    }

    // Remove evaluation from rubric's evaluations array
    await Rubric.findByIdAndUpdate(
      evaluation.rubric_id,
      { $pull: { rubric_evaluations: evaluation._id } }
    );

    await evaluation.deleteOne();
    return res.status(200).json({ message: ERROR_MESSAGES.DELETE_SUCCESS });
  } catch (error) {
    const errorResponse = handleError(error, 'Lỗi khi xóa tiêu chí đánh giá:');
    return res.status(500).json(errorResponse);
  }
}; 