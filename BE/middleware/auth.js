/* eslint-disable no-undef */
/* eslint-disable no-process-env */
// Middleware xác thực JWT và kiểm tra vai trò
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực JWT
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Không có token xác thực, truy cập bị từ chối.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Token hợp lệ nhưng không tìm thấy người dùng.' });
        }
        req.user = user;
        req.token = token;
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
    }
};

// Middleware kiểm tra vai trò
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ 
                success: false,
                message: 'Truy cập bị từ chối. Không xác định được vai trò người dùng.' 
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `Truy cập bị từ chối. Cần quyền: ${roles.join(', ')}. Quyền của bạn: ${req.user.role}` 
            });
        }
        next();
    };
};

module.exports = { auth, checkRole }; 