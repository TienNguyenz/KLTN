const RegistrationPeriod = require('../models/RegistrationPeriod');
const Semester = require('../models/Semester');

// Get all registration periods
exports.getAllRegistrationPeriods = async (req, res) => {
  try {
    const registrationPeriods = await RegistrationPeriod.find()
      .populate('registration_period_semester')
      .sort({ createdAt: -1 });
    res.status(200).json(registrationPeriods);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đợt đăng ký', error: error.message });
  }
};

// Create new registration period
exports.createRegistrationPeriod = async (req, res) => {
  try {
    // Check if semester exists
    const semester = await Semester.findById(req.body.registration_period_semester);
    if (!semester) {
      return res.status(404).json({ message: 'Không tìm thấy học kỳ' });
    }

    // Check for overlapping periods
    const overlapping = await RegistrationPeriod.findOne({
      registration_period_semester: req.body.registration_period_semester,
      $or: [
        {
          registration_period_start: { 
            $lte: req.body.registration_period_end,
            $gte: req.body.registration_period_start 
          }
        },
        {
          registration_period_end: { 
            $gte: req.body.registration_period_start,
            $lte: req.body.registration_period_end 
          }
        }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ 
        message: 'Đã tồn tại đợt đăng ký trong khoảng thời gian này' 
      });
    }

    const registrationPeriod = new RegistrationPeriod(req.body);
    await registrationPeriod.save();
    
    const savedPeriod = await RegistrationPeriod.findById(registrationPeriod._id)
      .populate('registration_period_semester');
    
    res.status(201).json(savedPeriod);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo đợt đăng ký mới', error: error.message });
  }
};

// Get registration period by ID
exports.getRegistrationPeriodById = async (req, res) => {
  try {
    const registrationPeriod = await RegistrationPeriod.findById(req.params.id)
      .populate('registration_period_semester');
    
    if (!registrationPeriod) {
      return res.status(404).json({ message: 'Không tìm thấy đợt đăng ký' });
    }
    
    res.status(200).json(registrationPeriod);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đợt đăng ký', error: error.message });
  }
};

// Update registration period
exports.updateRegistrationPeriod = async (req, res) => {
  try {
    // Check if semester exists if it's being updated
    if (req.body.registration_period_semester) {
      const semester = await Semester.findById(req.body.registration_period_semester);
      if (!semester) {
        return res.status(404).json({ message: 'Không tìm thấy học kỳ' });
      }
    }

    // Check for overlapping periods excluding current period
    if (req.body.registration_period_start && req.body.registration_period_end) {
      const overlapping = await RegistrationPeriod.findOne({
        _id: { $ne: req.params.id },
        registration_period_semester: req.body.registration_period_semester,
        $or: [
          {
            registration_period_start: { 
              $lte: req.body.registration_period_end,
              $gte: req.body.registration_period_start 
            }
          },
          {
            registration_period_end: { 
              $gte: req.body.registration_period_start,
              $lte: req.body.registration_period_end 
            }
          }
        ]
      });

      if (overlapping) {
        return res.status(400).json({ 
          message: 'Đã tồn tại đợt đăng ký trong khoảng thời gian này' 
        });
      }
    }

    const registrationPeriod = await RegistrationPeriod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('registration_period_semester');

    if (!registrationPeriod) {
      return res.status(404).json({ message: 'Không tìm thấy đợt đăng ký' });
    }

    res.status(200).json(registrationPeriod);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật đợt đăng ký', error: error.message });
  }
};

// Delete registration period
exports.deleteRegistrationPeriod = async (req, res) => {
  try {
    const registrationPeriod = await RegistrationPeriod.findByIdAndDelete(req.params.id);
    
    if (!registrationPeriod) {
      return res.status(404).json({ message: 'Không tìm thấy đợt đăng ký' });
    }

    res.status(200).json({ message: 'Xóa đợt đăng ký thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa đợt đăng ký', error: error.message });
  }
}; 