const mongoose = require('mongoose');

const registrationPeriodSchema = new mongoose.Schema({
  registration_period_semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  registration_period_start: {
    type: Number,
    required: true
  },
  registration_period_end: {
    type: Number,
    required: true
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

// Add validation for start and end dates
registrationPeriodSchema.pre('save', function(next) {
  if (this.registration_period_start >= this.registration_period_end) {
    next(new Error('Thời gian bắt đầu phải trước thời gian kết thúc'));
  }
  next();
});

// Add index for better query performance
registrationPeriodSchema.index({ registration_period_semester: 1 });
registrationPeriodSchema.index({ registration_period_status: 1 });

const RegistrationPeriod = mongoose.model('RegistrationPeriod', registrationPeriodSchema);

module.exports = RegistrationPeriod; 