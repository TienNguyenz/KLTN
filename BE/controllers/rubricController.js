/* eslint-disable no-undef */
const Rubric = require('../models/Rubric');
const RubricEvaluation = require('../models/RubricEvaluation');

// Constants
const ERROR_MESSAGES = {
  RUBRIC_NOT_FOUND: 'Không tìm thấy rubric',
  SERVER_ERROR: 'Lỗi máy chủ',
  INVALID_DATA: 'Dữ liệu không hợp lệ',
  DELETE_SUCCESS: 'Đã xóa rubric',
  REQUIRED_FIELDS: 'Vui lòng điền đầy đủ thông tin'
};

// Helper functions
const handleError = (error, customMessage) => {
  console.error(customMessage, error);
  return {
    message: error.message || ERROR_MESSAGES.SERVER_ERROR,
    error: error
  };
};

const validateRubricData = (data) => {
  const { rubric_name, rubric_description } = data;
  
  if (!rubric_name || !rubric_name.trim()) {
    return { isValid: false, message: 'Vui lòng nhập tên rubric' };
  }
  
  if (!rubric_description || !rubric_description.trim()) {
    return { isValid: false, message: 'Vui lòng nhập mô tả rubric' };
  }
  
  return { isValid: true };
};

/**
 * Lấy tất cả rubric
 * @route GET /api/rubrics
 */
exports.getAllRubrics = async (req, res) => {
  try {
    const rubrics = await Rubric.find()
      .populate('rubric_evaluations')
      .sort({ createdAt: -1 });
    return res.status(200).json(rubrics);
  } catch (error) {
    const errorResponse = handleError(error, 'Lỗi khi lấy danh sách rubric:');
    return res.status(500).json(errorResponse);
  }
};

/**
 * Lấy thông tin một rubric
 * @route GET /api/rubrics/:id
 */
exports.getRubricById = async (req, res) => {
  try {
    const rubric = await Rubric.findById(req.params.id)
      .populate('rubric_evaluations');
    
    if (!rubric) {
      return res.status(404).json({ message: ERROR_MESSAGES.RUBRIC_NOT_FOUND });
    }
    
    return res.status(200).json(rubric);
  } catch (error) {
    const errorResponse = handleError(error, 'Lỗi khi lấy thông tin rubric:');
    return res.status(500).json(errorResponse);
  }
};

/**
 * Tạo rubric mới
 * @route POST /api/rubrics
 */
exports.createRubric = async (req, res) => {
  try {
    // Validate input data
    const validation = validateRubricData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const rubric = new Rubric(req.body);
    const savedRubric = await rubric.save();
    return res.status(201).json(savedRubric);
  } catch (error) {
    // Xử lý lỗi duplicate key (trùng tên rubric)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.rubric_name) {
      return res.status(400).json({ message: 'Tên phiếu đánh giá đã tồn tại, vui lòng chọn tên khác.' });
    }
    const errorResponse = handleError(error, 'Lỗi khi tạo rubric mới:');
    return res.status(500).json(errorResponse);
  }
};

/**
 * Cập nhật rubric
 * @route PUT /api/rubrics/:id
 */
exports.updateRubric = async (req, res) => {
  try {
    // Validate input data
    const validation = validateRubricData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const rubric = await Rubric.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('rubric_evaluations');
    
    if (!rubric) {
      return res.status(404).json({ message: ERROR_MESSAGES.RUBRIC_NOT_FOUND });
    }

    return res.status(200).json(rubric);
  } catch (error) {
    const errorResponse = handleError(error, 'Lỗi khi cập nhật rubric:');
    return res.status(500).json(errorResponse);
  }
};

/**
 * Xóa rubric
 * @route DELETE /api/rubrics/:id
 */
exports.deleteRubric = async (req, res) => {
  try {
    const rubric = await Rubric.findById(req.params.id);
    if (!rubric) {
      return res.status(404).json({ message: ERROR_MESSAGES.RUBRIC_NOT_FOUND });
    }

    // Delete associated evaluations
    await RubricEvaluation.deleteMany({ rubric_id: rubric._id });
    
    await rubric.deleteOne();
    return res.status(200).json({ message: ERROR_MESSAGES.DELETE_SUCCESS });
  } catch (error) {
    const errorResponse = handleError(error, 'Lỗi khi xóa rubric:');
    return res.status(500).json(errorResponse);
  }
}; 