/* eslint-disable no-undef */
const User = require("../models/User");
const Major = require("../models/Major");

// Constants
const ERROR_MESSAGES = {
  USER_NOT_FOUND: "Không tìm thấy người dùng.",
  LECTURER_NOT_FOUND: "Không tìm thấy thông tin giảng viên.",
  UNAUTHORIZED_LECTURER: "Không có quyền truy cập thông tin giảng viên.",
  UNAUTHORIZED_UPDATE: "Không có quyền cập nhật thông tin giảng viên.",
  SERVER_ERROR: "Lỗi máy chủ.",
  INVALID_DATA: "Dữ liệu không hợp lệ."
};

const ROLES = {
  LECTURER: "giangvien"
};

// Helper functions
const handleError = (error, customMessage) => {
  console.error(customMessage, error);
  return {
    message: ERROR_MESSAGES.SERVER_ERROR,
    error: error.message
  };
};

const validateUserData = (data) => {
  const { user_phone, lecturer_phone } = data;
  if (user_phone && !/^[0-9]{10}$/.test(user_phone)) {
    return { isValid: false, message: "Số điện thoại không hợp lệ" };
  }
  if (lecturer_phone && !/^[0-9]{10}$/.test(lecturer_phone)) {
    return { isValid: false, message: "Số điện thoại giảng viên không hợp lệ" };
  }
  return { isValid: true };
};

/**
 * Lấy thông tin profile giảng viên
 * @route GET /api/users/profile/gv
 */
const getProfileGV = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    if (user.role === ROLES.LECTURER) {
      return res.status(200).json(user);
    }

    return res.status(403).json({ message: ERROR_MESSAGES.UNAUTHORIZED_LECTURER });
  } catch (error) {
    const errorResponse = handleError(error, "Lỗi khi lấy thông tin giảng viên:");
    res.status(500).json(errorResponse);
  }
};

/**
 * Cập nhật thông tin profile giảng viên
 * @route PUT /api/users/profile/gv
 */
const updateProfileGV = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== ROLES.LECTURER) {
      return res.status(403).json({ message: ERROR_MESSAGES.UNAUTHORIZED_UPDATE });
    }

    // Validate input data
    const validation = validateUserData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const { lecturer_phone, lecturer_department, ...otherFields } = req.body;
    const updatedLecturer = await User.findByIdAndUpdate(
      userId,
      { lecturer_phone, lecturer_department, ...otherFields },
      { new: true }
    ).select("-password");

    if (!updatedLecturer) {
      return res.status(404).json({ message: ERROR_MESSAGES.LECTURER_NOT_FOUND });
    }

    return res.status(200).json(updatedLecturer);
  } catch (error) {
    const errorResponse = handleError(error, "Lỗi khi cập nhật thông tin giảng viên:");
    res.status(500).json(errorResponse);
  }
};

/**
 * Lấy thông tin profile người dùng
 * @route GET /api/users/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    const profileData = { ...user.toObject() };

    if (user.user_major) {
      const major = await Major.findById(user.user_major);
      if (major) {
        Object.assign(profileData, {
          major_title: major.major_title,
          major_description: major.major_description,
          training_system: major.training_system
        });
      }
    }

    return res.status(200).json(profileData);
  } catch (error) {
    const errorResponse = handleError(error, "Lỗi khi lấy thông tin người dùng và chuyên ngành:");
    res.status(500).json(errorResponse);
  }
};

/**
 * Cập nhật thông tin profile người dùng
 * @route PUT /api/users/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { user_temporary_address, user_permanent_address, user_phone } = req.body;

    // Validate input data
    const validation = validateUserData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        user_temporary_address,
        user_permanent_address,
        user_phone
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    const errorResponse = handleError(error, "Lỗi khi cập nhật thông tin người dùng:");
    res.status(500).json(errorResponse);
  }
};

// Lấy chi tiết faculty theo _id
const getFacultyById = async (req, res) => {
  try {
    const faculty = await require('../models/Faculty').findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khoa' });
    }
    res.json({ success: true, data: faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getProfileGV,
  updateProfileGV,
  getFacultyById
};
