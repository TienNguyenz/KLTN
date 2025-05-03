const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Major = require('../models/Major');
const TopicType = require('../models/TopicType');
const Topic = require('../models/Topic');

// Route để tạo dữ liệu mẫu
router.post('/seed-data', async (req, res) => {
    try {
        // Tạo một số giảng viên mẫu
        const instructors = await User.create([
            { user_name: 'Nguyễn Văn A', user_email: 'nva@example.com', role: 'giangvien' },
            { user_name: 'Trần Thị B', user_email: 'ttb@example.com', role: 'giangvien' }
        ]);

        // Tạo một số chuyên ngành mẫu
        const majors = await Major.create([
            { major_name: 'Công nghệ phần mềm' },
            { major_name: 'Hệ thống thông tin' },
            { major_name: 'An toàn thông tin' }
        ]);

        // Tạo một số loại đề tài mẫu
        const topicTypes = await TopicType.create([
            { type_name: 'Đồ án tốt nghiệp' },
            { type_name: 'Khóa luận tốt nghiệp' },
            { type_name: 'Thực tập doanh nghiệp' }
        ]);

        // Tạo một số đề tài mẫu với references
        const topics = await Topic.create([
            {
                topic_title: 'Nghiên cứu về AI trong giáo dục',
                topic_description: 'Nghiên cứu ứng dụng AI trong giảng dạy',
                topic_instructor: instructors[0]._id,
                topic_major: majors[0]._id,
                topic_category: topicTypes[0]._id,
                topic_max_members: 3,
                topic_block: false
            },
            {
                topic_title: 'Phát triển hệ thống quản lý học tập',
                topic_description: 'Xây dựng LMS cho trường đại học',
                topic_instructor: instructors[1]._id,
                topic_major: majors[1]._id,
                topic_category: topicTypes[1]._id,
                topic_max_members: 2,
                topic_block: false
            }
        ]);

        res.json({ message: 'Dữ liệu mẫu đã được tạo thành công', data: { instructors, majors, topicTypes, topics } });
    } catch (error) {
        console.error('Lỗi khi tạo dữ liệu mẫu:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 