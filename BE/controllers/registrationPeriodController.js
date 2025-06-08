/* eslint-disable no-undef */
const RegistrationPeriod = require('../models/RegistrationPeriod');
const Semester = require('../models/Semester');

// Constants for error messages
const ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'Vui lòng điền đầy đủ thông tin',
  SEMESTER_NOT_FOUND: 'Không tìm thấy học kỳ',
  PERIOD_NOT_FOUND: 'Không tìm thấy đợt đăng ký',
  INVALID_DATES: 'Thời gian bắt đầu phải trước thời gian kết thúc',
  OUTSIDE_SEMESTER: 'Thời gian đăng ký phải nằm trong khoảng thời gian của học kỳ',
  OVERLAPPING_PERIOD: 'Đã tồn tại đợt đăng ký trong khoảng thời gian này',
  SERVER_ERROR: 'Lỗi server',
  DELETE_SUCCESS: 'Xóa đợt đăng ký thành công'
};

// Constants
const MS_PER_MONTH = 30 * 24 * 60 * 60; // 30 ngày, đơn vị: giây

// Helper functions
const validateDates = (start, end, semester) => {
  if (start >= end) {
    return { isValid: false, message: ERROR_MESSAGES.INVALID_DATES };
  }

  const semesterStart = new Date(semester.school_year_start).getTime() / 1000;
  const semesterEnd = new Date(semester.school_year_end).getTime() / 1000;

  if (start < semesterStart || end > semesterEnd) {
    return { isValid: false, message: ERROR_MESSAGES.OUTSIDE_SEMESTER };
  }

  return { isValid: true };
};

const checkOverlappingPeriods = async (period, excludeId = null) => {
  const query = {
    registration_period_semester: period.registration_period_semester,
    $or: [
      {
        registration_period_start: { 
          $lte: period.registration_period_end,
          $gte: period.registration_period_start 
        }
      },
      {
        registration_period_end: { 
          $gte: period.registration_period_start,
          $lte: period.registration_period_end 
        }
      }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return await RegistrationPeriod.findOne(query);
};

// Get all registration periods
exports.getAllRegistrationPeriods = async (req, res) => {
  try {
    const registrationPeriods = await RegistrationPeriod.find()
      .populate('registration_period_semester')
      .sort({ createdAt: -1 });
    res.status(200).json(registrationPeriods);
  } catch (error) {
    res.status(500).json({ 
      message: ERROR_MESSAGES.SERVER_ERROR, 
      error: error.message 
    });
  }
};

// Create new registration period
exports.createRegistrationPeriod = async (req, res) => {
  try {
    const { registration_period_semester, registration_period_start, registration_period_end } = req.body;

    // Validate required fields
    if (!registration_period_semester || !registration_period_start || !registration_period_end) {
      return res.status(400).json({ message: ERROR_MESSAGES.REQUIRED_FIELDS });
    }

    // Check if semester exists
    const semester = await Semester.findById(registration_period_semester);
    if (!semester) {
      return res.status(404).json({ message: ERROR_MESSAGES.SEMESTER_NOT_FOUND });
    }

    // Validate dates
    const dateValidation = validateDates(registration_period_start, registration_period_end, semester);
    if (!dateValidation.isValid) {
      return res.status(400).json({ message: dateValidation.message });
    }

    // Check for overlapping periods
    const hasOverlap = await checkOverlappingPeriods(req.body);
    if (hasOverlap) {
      return res.status(400).json({ message: ERROR_MESSAGES.OVERLAPPING_PERIOD });
    }

    // Tính các deadline tự động
    const advisor_request_deadline = Number(registration_period_start) + 2 * MS_PER_MONTH;
    const outline_proposal_deadline = Number(registration_period_start) + 4 * MS_PER_MONTH;
    const final_report_deadline = Number(registration_period_end);

    const registrationPeriod = new RegistrationPeriod({
      ...req.body,
      advisor_request_deadline,
      outline_proposal_deadline,
      final_report_deadline
    });
    await registrationPeriod.save();
    res.status(201).json(registrationPeriod);
  } catch (error) {
    res.status(500).json({ 
      message: ERROR_MESSAGES.SERVER_ERROR, 
      error: error.message 
    });
  }
};

// Get registration period by ID
exports.getRegistrationPeriodById = async (req, res) => {
  try {
    const registrationPeriod = await RegistrationPeriod.findById(req.params.id)
      .populate('registration_period_semester');
    
    if (!registrationPeriod) {
      return res.status(404).json({ message: ERROR_MESSAGES.PERIOD_NOT_FOUND });
    }
    
    res.status(200).json(registrationPeriod);
  } catch (error) {
    res.status(500).json({ 
      message: ERROR_MESSAGES.SERVER_ERROR, 
      error: error.message 
    });
  }
};

// Update registration period
exports.updateRegistrationPeriod = async (req, res) => {
  try {
    const { registration_period_semester, registration_period_start, registration_period_end } = req.body;

    // Check if registration period exists
    const existingPeriod = await RegistrationPeriod.findById(req.params.id);
    if (!existingPeriod) {
      return res.status(404).json({ message: ERROR_MESSAGES.PERIOD_NOT_FOUND });
    }

    // If semester is being updated, validate it
    if (registration_period_semester) {
      const semester = await Semester.findById(registration_period_semester);
      if (!semester) {
        return res.status(404).json({ message: ERROR_MESSAGES.SEMESTER_NOT_FOUND });
      }

      // Validate dates if they're being updated
      if (registration_period_start && registration_period_end) {
        const dateValidation = validateDates(registration_period_start, registration_period_end, semester);
        if (!dateValidation.isValid) {
          return res.status(400).json({ message: dateValidation.message });
        }

        // Check for overlapping periods
        const hasOverlap = await checkOverlappingPeriods(
          { ...req.body, registration_period_semester }, 
          req.params.id
        );
        if (hasOverlap) {
          return res.status(400).json({ message: ERROR_MESSAGES.OVERLAPPING_PERIOD });
        }
      }
    }

    // Tính lại các deadline nếu có cập nhật ngày bắt đầu/kết thúc
    let advisor_request_deadline = existingPeriod.advisor_request_deadline;
    let outline_proposal_deadline = existingPeriod.outline_proposal_deadline;
    let final_report_deadline = existingPeriod.final_report_deadline;
    if (registration_period_start) {
      advisor_request_deadline = Number(registration_period_start) + 2 * MS_PER_MONTH;
      outline_proposal_deadline = Number(registration_period_start) + 4 * MS_PER_MONTH;
    }
    if (registration_period_end) {
      final_report_deadline = Number(registration_period_end);
    }

    const updatedPeriod = await RegistrationPeriod.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        advisor_request_deadline,
        outline_proposal_deadline,
        final_report_deadline
      },
      { new: true }
    ).populate('registration_period_semester');

    res.status(200).json(updatedPeriod);
  } catch (error) {
    res.status(500).json({ 
      message: ERROR_MESSAGES.SERVER_ERROR, 
      error: error.message 
    });
  }
};

// Delete registration period
exports.deleteRegistrationPeriod = async (req, res) => {
  try {
    const registrationPeriod = await RegistrationPeriod.findByIdAndDelete(req.params.id);
    
    if (!registrationPeriod) {
      return res.status(404).json({ message: ERROR_MESSAGES.PERIOD_NOT_FOUND });
    }

    res.status(200).json({ message: ERROR_MESSAGES.DELETE_SUCCESS });
  } catch (error) {
    res.status(500).json({ 
      message: ERROR_MESSAGES.SERVER_ERROR, 
      error: error.message 
    });
  }
}; 