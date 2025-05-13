const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    user_name: {
        type: String,
        required: true
    },
    user_avatar: {
        type: String
    },
    user_date_of_birth: {
        type: String
    },
    user_CCCD: {
        type: String
    },
    user_phone: {
        type: String
    },
    user_permanent_address: {
        type: String
    },
    user_temporary_address: {
        type: String
    },
    user_department: {
        type: String
    },
    user_faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    },
    user_major: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major'
    },
    role: {
        type: String,
        enum: ['sinhvien', 'giangvien', 'giaovu'],
        required: true
    },
    user_status: {
        type: String,
        default: 'active'
    },
    user_average_grade: {
        type: String
    },
    user_transcript: {
        type: String
    }
}, {
    timestamps: true,
    collection: 'User'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // First try bcrypt comparison
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        if (isMatch) return true;
        
        // If bcrypt comparison fails, try direct comparison for backward compatibility
        return candidatePassword === this.password;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

module.exports = mongoose.model('User', userSchema);

 