import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

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

export { login, register }; 