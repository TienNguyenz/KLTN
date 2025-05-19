// RegistrationPeriod Schema: Quản lý các đợt đăng ký theo học kỳ
const mongoose = require('mongoose');

const registrationPeriodSchema = new mongoose.Schema({
  registration_period_semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    // required: [true, 'Học kỳ là bắt buộc']
  },
  registration_period_start: {
    type: Number,
    required: [true, 'Thời gian bắt đầu là bắt buộc'],
    min: [0, 'Thời gian bắt đầu không hợp lệ']
  },
  registration_period_end: {
    type: Number,
    required: [true, 'Thời gian kết thúc là bắt buộc'],
    min: [0, 'Thời gian kết thúc không hợp lệ']
  },
  registration_period_status: {
    type: Boolean,
    default: true
  },
  block_topic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Validate start < end
registrationPeriodSchema.pre('save', function(next) {
  if (this.registration_period_start >= this.registration_period_end) {
    return next(new Error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!'));
  }
  next();
});

// Indexes
registrationPeriodSchema.index({ registration_period_semester: 1 });
registrationPeriodSchema.index({ registration_period_status: 1 });

module.exports = mongoose.model('RegistrationPeriod', registrationPeriodSchema); 