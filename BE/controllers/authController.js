const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Tạo transporter để gửi email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'htiennguyen081103@gmail.com',
    pass: 'ezan zccz kiyl dxqm' // Thay bằng App Password của Gmail
  }
});

// Lưu trữ mã xác nhận tạm thời
const verificationCodes = new Map();

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt with:', { email });

        // Find user by email
        const user = await User.findOne({ email });
        console.log('Found user:', user);

        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({ message: 'Sai tài khoản' });
        }

        // Check password using both methods
        const isMatchHashed = await user.comparePassword(password);
        const isMatchUnhashed = password === user.password;

        if (!isMatchHashed && !isMatchUnhashed) {
            console.log('Password mismatch');
            return res.status(401).json({ message: 'Sai mật khẩu' });
        }

        // If password matches but is unhashed, update it to hashed version
        if (isMatchUnhashed && !isMatchHashed) {
            user.password = password;
            await user.save();
            console.log('Password updated to hashed version');
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Send response
        res.json({
            token,
            user: {
                id: user._id,
                user_id: user.user_id,
                user_name: user.user_name,
                email: user.email,
                role: user.role,
                user_avatar: user.user_avatar,
                user_department: user.user_department,
                user_faculty: user.user_faculty,
                user_major: user.user_major,
                user_status: user.user_status
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const register = async (req, res) => {
    try {
        const { 
            email, 
            password, 
            user_id,
            user_name,
            user_avatar,
            user_date_of_birth,
            user_CCCD,
            user_phone,
            user_permanent_address,
            user_temporary_address,
            user_department,
            user_faculty,
            user_major,
            role,
            user_status,
            user_average_grade,
            user_transcript
        } = req.body;

        // Check if user already exists
        let user = await User.findOne({ $or: [{ email }, { user_id }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            email,
            password,
            user_id,
            user_name,
            user_avatar,
            user_date_of_birth,
            user_CCCD,
            user_phone,
            user_permanent_address,
            user_temporary_address,
            user_department,
            user_faculty,
            user_major,
            role,
            user_status,
            user_average_grade,
            user_transcript
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Send response
        res.status(201).json({
            token,
            user: {
                id: user._id,
                user_id: user.user_id,
                user_name: user.user_name,
                email: user.email,
                role: user.role,
                user_avatar: user.user_avatar,
                user_department: user.user_department,
                user_faculty: user.user_faculty,
                user_major: user.user_major,
                user_status: user.user_status
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email' });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    // Tạo mã xác nhận ngẫu nhiên 6 số
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Lưu mã xác nhận với thời gian hết hạn (5 phút)
    verificationCodes.set(email, {
      code: verificationCode,
      expires: Date.now() + 5 * 60 * 1000 // 5 phút
    });

    // Gửi email chứa mã xác nhận
    const mailOptions = {
      from: 'htiennguyen081103@gmail.com',
      to: email,
      subject: 'Mã xác nhận đặt lại mật khẩu',
      html: `
        <h1>Yêu cầu đặt lại mật khẩu</h1>
        <p>Xin chào ${user.user_name},</p>
        <p>Mã xác nhận của bạn là: <strong>${verificationCode}</strong></p>
        <p>Mã này sẽ hết hạn sau 5 phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      message: 'Mã xác nhận đã được gửi đến email của bạn',
      email: email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // Kiểm tra mã xác nhận
    const verificationData = verificationCodes.get(email);
    if (!verificationData) {
      return res.status(400).json({ message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' });
    }

    if (verificationData.expires < Date.now()) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Mã xác nhận đã hết hạn' });
    }

    if (verificationData.code !== code) {
      return res.status(400).json({ message: 'Mã xác nhận không đúng' });
    }

    // Xóa mã xác nhận đã sử dụng
    verificationCodes.delete(email);

    res.json({ 
      message: 'Xác thực thành công',
      email: email
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy tài khoản',
        reason: 'Email không tồn tại trong hệ thống'
      });
    }

    // Kiểm tra mật khẩu mới
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu không hợp lệ',
        reason: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    // Gửi email thông báo đổi mật khẩu thành công
    const mailOptions = {
      from: 'htiennguyen081103@gmail.com',
      to: email,
      subject: 'Đặt lại mật khẩu thành công',
      html: `
        <h1>Đặt lại mật khẩu thành công</h1>
        <p>Xin chào ${user.user_name},</p>
        <p>Mật khẩu của bạn đã được đặt lại thành công.</p>
        <p>Nếu bạn không thực hiện thao tác này, vui lòng liên hệ với chúng tôi ngay lập tức.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true,
      message: 'Đặt lại mật khẩu thành công',
      details: 'Mật khẩu mới đã được cập nhật và thông báo đã được gửi đến email của bạn'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đặt lại mật khẩu thất bại',
      reason: 'Có lỗi xảy ra trong quá trình xử lý'
    });
  }
};

module.exports = { login, register, forgotPassword, verifyCode, resetPassword }; 