/* eslint-disable no-undef */
const Council = require('../models/Council');
const Major = require('../models/Major');
const mongoose = require('mongoose');

// Constants
const ERROR_MESSAGES = {
  COUNCIL_NOT_FOUND: 'Không tìm thấy hội đồng',
  COUNCIL_EXISTS: 'Tên hội đồng đã tồn tại!',
  SERVER_ERROR: 'Lỗi máy chủ',
  INVALID_DATA: 'Dữ liệu không hợp lệ',
  DELETE_SUCCESS: 'Đã xóa hội đồng thành công',
  REQUIRED_FIELDS: 'Vui lòng điền đầy đủ thông tin'
};

// Helper functions
const handleError = (error, customMessage) => {
  console.error(customMessage, error);
  return {
    message: ERROR_MESSAGES.SERVER_ERROR,
    error: error.message
  };
};

const validateCouncilData = (data) => {
  const { assembly_name, assembly_major, chairman, secretary, members } = data;
  
  if (!assembly_name || !assembly_name.trim()) {
    return { isValid: false, message: 'Vui lòng nhập tên hội đồng' };
  }
  
  if (!assembly_major) {
    return { isValid: false, message: 'Vui lòng chọn chuyên ngành' };
  }
  
  if (!chairman) {
    return { isValid: false, message: 'Vui lòng chọn chủ tịch hội đồng' };
  }
  
  if (!secretary) {
    return { isValid: false, message: 'Vui lòng chọn thư ký hội đồng' };
  }
  
  if (!members || !Array.isArray(members) || members.length === 0) {
    return { isValid: false, message: 'Vui lòng chọn ít nhất một thành viên hội đồng' };
  }
  
  return { isValid: true };
};

// Get all councils
exports.getAllCouncils = async (req, res) => {
  try {
    const councils = await Council.find()
      .populate('assembly_major', 'major_name')
      .populate('chairman', 'fullname')
      .populate('secretary', 'fullname')
      .populate('members', 'fullname');

    res.status(200).json({
      success: true,
      data: councils
    });
  } catch (error) {
    const errorResponse = handleError(error, 'Error getting councils:');
    res.status(500).json(errorResponse);
  }
};

// Create new council
exports.createCouncil = async (req, res) => {
  try {
    const validation = validateCouncilData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const { assembly_name, assembly_major } = req.body;

    // Check if council name exists
    const existingCouncil = await Council.findOne({ assembly_name });
    if (existingCouncil) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.COUNCIL_EXISTS
      });
    }

    // Check if major exists
    const major = await Major.findById(assembly_major);
    if (!major) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy chuyên ngành'
      });
    }

    const council = await Council.create(req.body);

    res.status(201).json({
      success: true,
      data: council
    });
  } catch (error) {
    const errorResponse = handleError(error, 'Error creating council:');
    res.status(500).json(errorResponse);
  }
};

// Update council
exports.updateCouncil = async (req, res) => {
  try {
    const validation = validateCouncilData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const { id } = req.params;
    const { assembly_name, assembly_major } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_DATA
      });
    }

    // Check if council exists
    const council = await Council.findById(id);
    if (!council) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.COUNCIL_NOT_FOUND
      });
    }

    // Check if new name conflicts with existing council
    if (assembly_name !== council.assembly_name) {
      const existingCouncil = await Council.findOne({ assembly_name });
      if (existingCouncil) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.COUNCIL_EXISTS
        });
      }
    }

    // Check if major exists
    const major = await Major.findById(assembly_major);
    if (!major) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy chuyên ngành'
      });
    }

    const updatedCouncil = await Council.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCouncil
    });
  } catch (error) {
    const errorResponse = handleError(error, 'Error updating council:');
    res.status(500).json(errorResponse);
  }
};

// Delete council
exports.deleteCouncil = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_DATA
      });
    }

    const council = await Council.findById(id);
    if (!council) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.COUNCIL_NOT_FOUND
      });
    }

    await council.deleteOne();

    res.status(200).json({
      success: true,
      message: ERROR_MESSAGES.DELETE_SUCCESS
    });
  } catch (error) {
    const errorResponse = handleError(error, 'Error deleting council:');
    res.status(500).json(errorResponse);
  }
}; 