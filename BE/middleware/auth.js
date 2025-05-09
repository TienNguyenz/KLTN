const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        console.log("Headers:", req.headers); // In toàn bộ headers
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log("Token from header:", token);
        
        if (!token) {
            console.log("No token found");
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        const user = await User.findById(decoded.id);
        console.log("User found:", user);

        if (!user) {
            console.log("User not found for token");
            return res.status(401).json({ message: 'Token is valid but user not found' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Access denied. You do not have the required role.' 
            });
        }
        next();
    };
};

module.exports = { auth, checkRole }; 