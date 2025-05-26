/* eslint-disable no-undef */
// Route: Đề tài (Topic)
// const express = require('express'); // Giữ lại comment này nếu có
const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const User = require('../models/User');
const Major = require('../models/Major');
const TopicType = require('../models/TopicType');
const UserNotification = require('../models/UserNotification');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const libre = require('libreoffice-convert');
const topicController = require('../controllers/topicController');
const { auth } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

// console.log('Route file loaded'); // Xóa dòng log này

// Lấy danh sách loại đề tài
router.get('/topic-types', async (req, res) => {
  console.log('topic.js: Hit GET /topic-types');
  try {
    const types = await TopicType.find();
    res.json({ success: true, data: types });
  } catch (err) {
    console.error('topic.js: Error in GET /topic-types', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Review topics routes
router.get('/review', topicController.getReviewTopics);

router.get('/review/:id', (req, res, next) => {
  console.log(`topic.js: Hit GET /review/${req.params.id}`);
  next(); // Chuyển tiếp request đến controller
}, topicController.getReviewTopicById);

// Committee topics routes
router.get('/committee', (req, res, next) => {
  console.log('topic.js: Hit GET /committee');
  next(); // Chuyển tiếp request đến controller
}, topicController.getCommitteeTopics);

router.get('/committee/:id', (req, res, next) => {
  console.log(`topic.js: Hit GET /committee/${req.params.id}`);
  next(); // Chuyển tiếp request đến controller
}, topicController.getCommitteeTopicById);

// Lấy tất cả đề tài đã duyệt và đang quản lý
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find({
      status: 'active'
    })
      .populate('topic_instructor', 'user_name')
      .populate('topic_major', 'major_name')
      .populate('topic_category', 'type_name')
      .populate('topic_group_student', 'user_name user_id');
    res.json({ success: true, data: topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy chi tiết đề tài theo ID
router.get('/:id', async (req, res) => {
  console.log(`topic.js: Hit GET /${req.params.id}`);
  try {
    // Kiểm tra xem id có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`topic.js: Invalid ID format: ${req.params.id}`);
      return res.status(400).json({ success: false, message: 'ID đề tài không hợp lệ' });
    }

    const topic = await Topic.findById(req.params.id)
      .populate('topic_instructor', 'user_name user_id')
      .populate('topic_major', 'major_title')
      .populate('topic_category', 'topic_category_title')
      .populate('topic_group_student', 'user_name user_id')
      .populate('topic_creator', 'user_name user_id role')
      .populate({ path: 'topic_assembly', model: 'Council', select: 'assembly_name' });
    if (!topic) {
      console.log(`topic.js: Topic with ID ${req.params.id} not found`);
      return res.status(404).json({ success: false, message: 'Không tìm thấy đề tài' });
    }
    const formattedTopic = {
      ...topic.toObject(),
      topic_instructor: topic.topic_instructor ? {
        name: topic.topic_instructor.user_name,
        id: topic.topic_instructor.user_id
      } : null,
      topic_major: topic.topic_major ? {
        title: topic.topic_major.major_title
      } : null,
      topic_category: topic.topic_category ? {
        title: topic.topic_category.topic_category_title
      } : null,
      topic_group_student: (topic.topic_group_student || []).map(student => ({
        _id: student._id,
        user_id: student.user_id,
        user_name: student.user_name
      })),
      topic_creator: topic.topic_creator ? {
        name: topic.topic_creator.user_name,
        id: topic.topic_creator.user_id,
        role: topic.topic_creator.role
      } : null
    };
    res.json({ success: true, data: formattedTopic });
  } catch (err) {
    console.error('topic.js: Error in GET /:id', err);
    // Kiểm tra nếu lỗi là do cast ID không hợp lệ (ví dụ khi ID không phải ObjectId)
    if (err.name === 'CastError') {
       return res.status(400).json({ success: false, message: 'Định dạng ID đề tài không hợp lệ', error: err.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin đề tài', error: err.message });
  }
});

// Đăng ký đề tài
router.post('/:id/register', async (req, res) => {
  console.log(`topic.js: Hit POST /${req.params.id}/register`);
  try {
    console.log('Registration request:', {
      topicId: req.params.id,
      body: req.body
    });

    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    }

    if (topic.topic_block) {
      return res.status(400).json({ message: 'Đề tài đã bị khóa' });
    }

    const { studentId, ...otherMembers } = req.body;
    console.log('Processing registration for:', {
      leader: studentId,
      members: otherMembers
    });

    if (!studentId) {
      return res.status(400).json({ message: 'Thiếu thông tin người đăng ký' });
    }

    // Kiểm tra người đăng ký
    const leader = await User.findById(studentId);
    if (!leader) {
      return res.status(400).json({ message: 'Không tìm thấy thông tin người đăng ký' });
    }

    // Kiểm tra xem sinh viên đã có đề tài chưa
    const existingTopic = await Topic.findOne({
      'topic_group_student': studentId
    }).populate('topic_group_student', 'user_name user_id');

    if (existingTopic) {
      return res.status(400).json({ 
        message: `Sinh viên ${leader.user_name} (${leader.user_id}) đã đăng ký đề tài "${existingTopic.topic_title}" rồi.` 
      });
    }

    // Thu thập tất cả thành viên
    const memberIds = [studentId];

    // Xử lý các thành viên khác
    for (let i = 2; i <= topic.topic_max_members; i++) {
      const memberId = otherMembers[`member${i}Id`];
      if (memberId) {
        try {
          const member = await User.findById(memberId);
            if (!member) {
            return res.status(400).json({ message: `Không tìm thấy thành viên ${i}` });
            }
            if (member.role !== 'sinhvien') {
            return res.status(400).json({ message: `Thành viên ${i} không phải là sinh viên` });
            }
            memberIds.push(memberId);
        } catch (err) {
          console.error('Error checking member:', err);
          return res.status(400).json({ message: `Lỗi khi kiểm tra thành viên ${i}: ${err.message}` });
        }
      }
    }

    // Kiểm tra số lượng thành viên
    if (memberIds.length > topic.topic_max_members) {
      return res.status(400).json({
        message: `Số lượng thành viên vượt quá giới hạn cho phép (tối đa ${topic.topic_max_members} người)`
      });
    }

    // Kiểm tra trùng thành viên
    const uniqueMembers = [...new Set(memberIds)];
    if (uniqueMembers.length !== memberIds.length) {
      return res.status(400).json({ message: 'Không được chọn trùng thành viên' });
    }

    // Kiểm tra đăng ký trùng
    const existingRegistrations = await Topic.find({
      'topic_group_student': { $in: memberIds }
    }).populate('topic_group_student', 'user_name user_id');

    if (existingRegistrations.length > 0) {
      const registeredMembers = existingRegistrations
        .map(t => t.topic_group_student)
        .flat()
        .filter(member => memberIds.includes(member._id.toString()));

      const memberDetails = registeredMembers.map(m => ({
        name: m.user_name,
        id: m.user_id,
        topic: existingRegistrations.find(t => 
          t.topic_group_student.some(s => s._id.toString() === m._id.toString())
        )?.topic_title
      }));

      return res.status(400).json({
        message: 'Một hoặc nhiều thành viên đã đăng ký đề tài khác',
        registeredMembers: memberDetails.map(m => 
          `${m.name} (${m.id}) - Đã đăng ký đề tài: ${m.topic}`
        )
      });
    }

    // Cập nhật topic
    topic.topic_group_student = memberIds;
    if (memberIds.length >= topic.topic_max_members) {
      topic.topic_block = true;
    }

    await topic.save();
    await topic.populate('topic_group_student', 'user_name user_id');

    console.log('Registration successful:', {
      topicId: topic._id,
      members: topic.topic_group_student
    });

    // Gửi thông báo cho giảng viên hướng dẫn
    await UserNotification.create({
      user_notification_title: 'Nhóm sinh viên đăng ký đề tài',
      user_notification_sender: studentId, // id sinh viên trưởng nhóm
      user_notification_recipient: topic.topic_instructor, // id giảng viên
      user_notification_content: `Nhóm sinh viên vừa đăng ký đề tài "${topic.topic_title}". Vui lòng kiểm tra!`,
      user_notification_type: 2,
      user_notification_isRead: false,
      user_notification_topic: 'topic',
    });

    res.json({
      message: 'Đăng ký thành công',
      topic
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Có lỗi xảy ra khi đăng ký đề tài',
      error: err.message
    });
  }
});

// Đề xuất đề tài mới
router.post('/propose', upload.single('guidanceFile'), async (req, res) => {
  console.log('topic.js: Hit POST /propose');
  try {
    const {
      topic_title,
      topic_instructor,
      topic_major,
      topic_category,
      topic_description,
      topic_max_members,
      topic_group_student,
      topic_creator
    } = req.body;

    console.log('Received proposal data:', req.body);

    // Đảm bảo topic_group_student luôn là mảng
    const safe_group_student = Array.isArray(topic_group_student) ? topic_group_student : [];

    // Kiểm tra các trường bắt buộc
    if (!topic_title || !topic_instructor || !topic_major || !topic_category || !topic_description || !topic_max_members || !topic_creator) {
      return res.status(400).json({ 
        message: 'Vui lòng điền đầy đủ thông tin đề tài.',
        missingFields: {
          topic_title: !topic_title,
          topic_instructor: !topic_instructor,
          topic_major: !topic_major,
          topic_category: !topic_category,
          topic_description: !topic_description,
          topic_max_members: !topic_max_members,
          topic_creator: !topic_creator
        }
      });
    }

    // Nếu có thành viên thì kiểm tra, còn không thì bỏ qua toàn bộ block kiểm tra thành viên
    if (safe_group_student.length > 0) {
    // Kiểm tra xem các thành viên đã có đề tài chưa
    const existingTopics = await Topic.find({
        'topic_group_student': { $in: safe_group_student },
        status: { $ne: 'rejected' },
        topic_teacher_status: { $ne: 'rejected' }
    }).populate('topic_group_student', 'user_name user_id');

    if (existingTopics.length > 0) {
      const registeredMembers = existingTopics
        .map(t => t.topic_group_student)
        .flat()
          .filter(member => safe_group_student.includes(member._id.toString()));

      const memberDetails = registeredMembers.map(m => ({
        name: m.user_name,
        id: m.user_id,
        topic: existingTopics.find(t => 
          t.topic_group_student.some(s => s._id.toString() === m._id.toString())
        )?.topic_title
      }));

      return res.status(400).json({
        message: 'Một hoặc nhiều thành viên đã đăng ký đề tài khác',
        registeredMembers: memberDetails.map(m => 
          `${m.name} (${m.id}) - Đã đăng ký đề tài: ${m.topic}`
        )
      });
    }

    // Validate group members
      if (safe_group_student.length > topic_max_members) {
      return res.status(400).json({ 
        message: `Số lượng thành viên vượt quá giới hạn cho phép (tối đa ${topic_max_members} người).` 
      });
    }

    // Check for duplicate members
      const uniqueMembers = [...new Set(safe_group_student)];
      if (uniqueMembers.length !== safe_group_student.length) {
      return res.status(400).json({ message: 'Không được chọn trùng thành viên.' });
    }

      // Check if members exist and are students
      for (const memberId of safe_group_student) {
        const member = await User.findById(memberId);
        if (!member) {
          return res.status(400).json({ message: `Không tìm thấy thông tin thành viên với ID ${memberId}` });
        }
        if (member.role !== 'sinhvien') {
          return res.status(400).json({ message: `Thành viên ${member.user_name} không phải là sinh viên` });
        }
      }
    }

    // Kiểm tra instructor, major, topic type như cũ
      const instructor = await User.findById(topic_instructor);
      if (!instructor) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin giảng viên hướng dẫn.' });
      }
      if (instructor.role !== 'giangvien') {
        return res.status(400).json({ message: 'Người được chọn không phải là giảng viên.' });
      }
      const major = await Major.findById(topic_major);
      if (!major) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin chuyên ngành.' });
      }
      const topicType = await TopicType.findById(topic_category);
      if (!topicType) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin loại đề tài.' });
      }

    // Tạo đề tài mới
    const newTopic = new Topic({
      topic_title,
      topic_instructor,
      topic_major,
      topic_category,
      topic_description,
      topic_max_members,
      topic_group_student: safe_group_student,
      topic_creator,
      topic_teacher_status: 'pending',
      topic_leader_status: 'pending',
      topic_block: false,
      status: 'pending',
    });

    await newTopic.save();

    console.log('Creating notification for instructor:', {
      sender: topic_creator,
      recipient: topic_instructor,
      title: topic_title
    });

    // Tạo thông báo cho giảng viên hướng dẫn
    try {
      const notification = await UserNotification.create({
        user_notification_title: 'Đề xuất đề tài mới',
        user_notification_sender: topic_creator, // id sinh viên
        user_notification_recipient: topic_instructor, // id giảng viên
        user_notification_content: `Sinh viên đã đề xuất đề tài mới: "${topic_title}". Vui lòng kiểm tra và duyệt đề tài trong mục "Đề tài sinh viên đề xuất"!`,
        user_notification_type: 2,
        user_notification_isRead: false,
        user_notification_topic: 'topic',
      });
      console.log('Notification created successfully:', notification);
    } catch (error) {
      console.error('Error creating notification:', error);
    }

    // Populate các trường liên quan (không cần populate topic_group_student nếu mảng rỗng)
    await newTopic.populate([
      { path: 'topic_instructor', select: 'user_name user_id' },
      { path: 'topic_major', select: 'major_title' },
      { path: 'topic_category', select: 'topic_category_title' }
    ]);
    if (safe_group_student.length > 0) {
      await newTopic.populate({ path: 'topic_group_student', select: 'user_name user_id' });
    }

    res.status(201).json({
      message: 'Đề xuất đề tài thành công.',
      topic: newTopic
    });

  } catch (error) {
    console.error('Error proposing topic:', error);
    res.status(500).json({
      message: 'Có lỗi xảy ra khi đề xuất đề tài.',
      error: error.message
    });
  }
});

// Thêm loại đề tài mới
router.post('/topic-types', async (req, res) => {
  console.log('topic.js: Hit POST /topic-types');
  try {
    const { topic_category_title, topic_category_description } = req.body;
    
    if (!topic_category_title) {
      return res.status(400).json({ message: 'Tên loại đề tài là bắt buộc' });
    }

    const newType = new TopicType({
      topic_category_title,
      topic_category_description
    });

    await newType.save();
    res.status(201).json(newType);
  } catch (err) {
    console.error('Error creating topic type:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách đề xuất của giảng viên
router.get('/instructor/:instructorId/proposals', async (req, res) => {
  console.log(`topic.js: Hit GET /instructor/${req.params.instructorId}/proposals`);
  try {
    const topics = await Topic.find({
      topic_instructor: req.params.instructorId,
      topic_teacher_status: 'pending',
      topic_leader_status: 'pending',
      status: { $ne: 'rejected' }
    })
    .populate('topic_group_student', 'user_name user_id')
    .populate('topic_major', 'major_title')
    .populate('topic_category', 'topic_category_title')
    .sort({ createdAt: -1 });
    console.log('Kết quả trả về:', topics.length, topics.map(t => t.topic_title));
    res.json(topics);
  } catch (err) {
    console.error('Error fetching instructor proposals:', err);
    res.status(500).json({ error: err.message });
  }
});

// Giảng viên duyệt đề tài
router.put('/:id/approve-by-lecturer', async (req, res) => {
  console.log(`topic.js: Hit PUT /${req.params.id}/approve-by-lecturer`);
  try {
    // Populate để lấy _id của từng sinh viên
    const topic = await Topic.findById(req.params.id).populate('topic_group_student', '_id user_name user_id');
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    topic.topic_teacher_status = 'approved';
    topic.topic_leader_status = 'approved';
    topic.status = 'active';
    await topic.save();

    // Gửi thông báo cho từng sinh viên trong nhóm
    if (topic.topic_group_student && topic.topic_group_student.length > 0) {
      const notifications = topic.topic_group_student.map(student => ({
        user_notification_title: 'Đề tài đã được duyệt',
        user_notification_sender: topic.topic_instructor, // hoặc req.user?._id nếu có auth
        user_notification_recipient: student._id,
        user_notification_content: `Đề tài "${topic.topic_title}" của bạn đã được giảng viên duyệt.`,
        user_notification_type: 2,
        user_notification_isRead: false,
        user_notification_topic: 'topic',
      }));
      await UserNotification.insertMany(notifications);
    }

    res.json({ message: 'Đã duyệt đề tài thành công', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi duyệt đề tài bởi giảng viên', error: err.message });
  }
});

// Leader duyệt đề tài
router.put('/:id/approve-by-leader', async (req, res) => {
  console.log(`topic.js: Hit PUT /${req.params.id}/approve-by-leader`);
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    topic.topic_leader_status = 'approved';
    await topic.save();

    // Gửi thông báo cho giảng viên nếu có comment
    const { comment } = req.body;
    if (comment && comment.trim() && topic.topic_instructor) {
      // Ưu tiên lấy sender từ req.user, nếu không có thì lấy leader đầu tiên trong nhóm
      const sender = req.user?._id || (topic.topic_group_student?.[0] ?? null);
      if (sender && topic.topic_instructor) {
        const notifications = [
          {
            user_notification_title: 'Đề tài đã được duyệt',
            user_notification_sender: sender,
            user_notification_recipient: topic.topic_instructor,
            user_notification_content: `Đề tài "${topic.topic_title}" đã được leader duyệt.\nNhận xét: ${comment}`,
            user_notification_type: 2,
            user_notification_isRead: false,
            user_notification_topic: 'topic',
          }
        ];
        await UserNotification.insertMany(notifications);
      }
    }

    res.json({ message: 'Đề tài đã được leader duyệt', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi duyệt đề tài bởi leader', error: err.message });
  }
});

// Lấy danh sách đề tài chờ leader duyệt
router.get('/leader/pending-topics', async (req, res) => {
  console.log('topic.js: Hit GET /leader/pending-topics');
  try {
    const topics = await Topic.find({
      topic_teacher_status: 'approved',
      topic_leader_status: 'pending'
    })
    .populate('topic_instructor', 'user_name')
    .populate('topic_major', 'major_title')
    .populate('topic_category', 'topic_category_title')
    .populate('topic_group_student', 'user_name user_id')
    .sort({ createdAt: -1 });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leader từ chối đề tài
router.put('/:id/reject-by-leader', async (req, res) => {
  console.log(`topic.js: Hit PUT /${req.params.id}/reject-by-leader`);
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    topic.topic_leader_status = 'rejected';
    topic.topic_teacher_status = 'rejected';
    topic.status = 'rejected';
    topic.topic_group_student = []; // Gỡ toàn bộ sinh viên khỏi đề tài
    topic.reject_reason = req.body.reason || '';
    await topic.save();

    // Gửi thông báo cho giảng viên
    const { comment } = req.body;
    let recipientId = topic.topic_creator;
    const mongoose = require('mongoose');
    if (!recipientId) {
      console.error('topic_creator is null or undefined for topic:', topic._id);
      return res.status(400).json({ message: 'Không tìm thấy sinh viên nhận thông báo!' });
    }
    if (typeof recipientId === 'string') {
      if (mongoose.Types.ObjectId.isValid(recipientId)) {
        recipientId = new mongoose.Types.ObjectId(recipientId);
      } else {
        console.error('topic_creator không phải là ObjectId hợp lệ:', recipientId);
        // Vẫn cho phép từ chối đề tài, chỉ không gửi notification
        return res.json({ message: 'Đã từ chối đề tài (không gửi được thông báo do topic_creator không hợp lệ)', topic });
      }
    }

    try {
      const notification = await UserNotification.create({
        user_notification_title: 'Đề tài bị từ chối',
        user_notification_sender: req.user?._id,
        user_notification_recipient: recipientId,
        user_notification_content: `Đề tài "${topic.topic_title}" đã bị từ chối. Lý do: ${req.body.reason || 'Không có lý do cụ thể.'}`,
        user_notification_type: 2,
        user_notification_isRead: false,
        user_notification_topic: 'topic',
      });
      console.log('Notification đã tạo:', notification);
    } catch (err) {
      console.error('Lỗi khi tạo notification:', err);
    }

    res.json({ message: 'Đã từ chối đề tài và gửi thông báo cho sinh viên', topic });
  } catch (err) {
    console.error('Lỗi khi từ chối đề tài:', err);
    res.status(500).json({ message: 'Lỗi khi từ chối đề tài', error: err.message });
  }
});

// Lấy đề tài mà sinh viên đã đăng ký
router.get('/student/:user_id', async (req, res) => {
  console.log(`topic.js: Hit GET /student/${req.params.user_id}`);
  try {
    // Đầu tiên tìm user theo user_id
    const user = await User.findOne({ user_id: req.params.user_id });
    if (!user) {
      return res.json(null);
    }

    // Sau đó tìm topic có chứa _id của user trong mảng topic_group_student
    let topic = await Topic.findOne({
      topic_group_student: user._id,
      status: { $ne: 'rejected' },
      topic_teacher_status: { $ne: 'rejected' }
    })
      .populate('topic_instructor', 'user_name')
      .populate('topic_major', 'major_title')
      .populate('topic_category', 'topic_category_title')
      .populate('topic_group_student', 'user_name user_id')
      .populate('topic_reviewer', 'user_name user_id')
      .populate({ path: 'topic_assembly', model: 'Council', select: 'assembly_name' });
    if (!topic) {
      // Nếu không có đề tài hợp lệ, lấy đề tài bị từ chối gần nhất
      topic = await Topic.findOne({
        topic_group_student: user._id,
        $or: [
          { status: 'rejected' },
          { topic_teacher_status: 'rejected' }
        ]
      })
        .sort({ updatedAt: -1 })
        .populate('topic_instructor', 'user_name')
        .populate('topic_major', 'major_title')
        .populate('topic_category', 'topic_category_title')
        .populate('topic_group_student', 'user_name user_id')
        .populate('topic_reviewer', 'user_name user_id')
        .populate({ path: 'topic_assembly', model: 'Council', select: 'assembly_name' });
    }
    res.json(topic);
  } catch (err) {
    console.error('Error fetching student topic:', err);
    res.status(500).json({ error: err.message });
  }
});

// Sinh viên hủy đăng ký đề tài
router.post('/:id/cancel-registration', async (req, res) => {
  console.log(`topic.js: Hit POST /${req.params.id}/cancel-registration`);
  try {
    let { studentId } = req.body;
    let topic = await Topic.findById(req.params.id).populate('topic_creator');
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });

    // Kiểm tra quyền trưởng nhóm
    const isLeader = (topic.topic_group_student.length > 0 && topic.topic_group_student[0].toString() === studentId)
      || (topic.topic_creator && topic.topic_creator._id && topic.topic_creator._id.toString() === studentId);
    if (!isLeader) {
      return res.status(403).json({ message: 'Chỉ trưởng nhóm mới có quyền hủy đề tài.' });
    }

    // Log để debug
    console.log('Cancel registration:', { topicId: topic._id, topic_creator: topic.topic_creator, studentId });

    // Đảm bảo topic_creator là object có role
    let creatorRole = null;
    if (topic.topic_creator && typeof topic.topic_creator === 'object' && topic.topic_creator.role) {
      creatorRole = topic.topic_creator.role;
    } else if (topic.topic_creator && typeof topic.topic_creator === 'string') {
      // Nếu là ObjectId, truy vấn User
      const creatorUser = await User.findById(topic.topic_creator);
      creatorRole = creatorUser?.role;
    }
    console.log('Creator role:', creatorRole);

    // Nếu là đề tài đề xuất bởi sinh viên thì xóa luôn đề tài
    if (creatorRole === 'sinhvien') {
      await Topic.deleteOne({ _id: topic._id });
      // Gửi thông báo cho giảng viên
      await UserNotification.create({
        user_notification_title: 'Sinh viên đã hủy đề xuất đề tài',
        user_notification_sender: studentId,
        user_notification_recipient: topic.topic_instructor,
        user_notification_content: `Sinh viên đã hủy đề xuất đề tài "${topic.topic_title}". Đề tài đã bị xóa khỏi hệ thống!`,
        user_notification_type: 2,
        user_notification_isRead: false,
        user_notification_topic: 'topic',
      });
      return res.json({ message: 'Đã hủy đăng ký và xóa đề tài đề xuất thành công!' });
    }

    // Nếu là đề tài có sẵn, gỡ toàn bộ sinh viên khỏi nhóm
    topic.topic_group_student = [];
    topic.topic_teacher_status = 'pending';
    topic.topic_leader_status = 'pending';
    topic.topic_block = false;
    await topic.save();

    // Gửi thông báo cho giảng viên
    await UserNotification.create({
      user_notification_title: 'Sinh viên đã hủy đăng ký đề tài',
      user_notification_sender: studentId,
      user_notification_recipient: topic.topic_instructor,
      user_notification_content: `Nhóm sinh viên đã hủy đăng ký đề tài "${topic.topic_title}". Đề tài đã được mở lại để đăng ký!`,
      user_notification_type: 2,
      user_notification_isRead: false,
      user_notification_topic: 'topic',
    });

    res.json({ message: 'Hủy đăng ký đề tài thành công!' });
  } catch (err) {
    console.error('Cancel registration error:', err);
    res.status(500).json({ message: 'Lỗi khi hủy đăng ký đề tài', error: err.message });
  }
});

// Lấy tất cả đề tài của 1 giảng viên (không filter trạng thái)
router.get('/instructor/:instructorId/all', async (req, res) => {
  // console.log(`topic.js: Hit GET /instructor/${req.params.instructorId}/all`); // Xóa dòng này (đã xóa ở trên, nhưng đảm bảo)
  try {
    const instructorId = req.params.instructorId;
    // let objectId = null; // Xóa dòng này (đã xóa ở trên, nhưng đảm bảo)
    
    // Validate instructorId
    if (!instructorId) {
      return res.status(400).json({ error: 'Instructor ID is required' });
    }

    // Convert to ObjectId if valid
    // if (mongoose.Types.ObjectId.isValid(instructorId)) { // Xóa khối này (đã xóa ở trên, nhưng đảm bảo)
    //   objectId = new mongoose.Types.ObjectId(instructorId);
    // }

    // console.log('Querying topics for instructor:', { // Dòng này đã xóa
    //   instructorId,
    //   objectId,
    //   isValid: mongoose.Types.ObjectId.isValid(instructorId)
    // });

    // Find all topics
    const allTopics = await Topic.find({})
      .populate('topic_instructor', 'user_name')
      .populate('topic_category', 'type_name topic_category_title')
      .lean();

    // Log topic details for debugging
    // allTopics.forEach(topic => { // Khối này đã xóa
    //   console.log('Topic details:', { // Khối này đã xóa
    //     id: topic._id,
    //     title: topic.topic_title,
    //     instructor: topic.topic_instructor,
    //     instructorId: topic.topic_instructor?._id,
    //     instructorType: typeof topic.topic_instructor,
    //     isObjectId: topic.topic_instructor instanceof mongoose.Types.ObjectId
    //   });
    // });

    // Filter topics by instructor
    const matchedTopics = allTopics.filter(topic => {
      const topicInstructor = topic.topic_instructor;
      if (!topicInstructor) return false;

      // Handle both ObjectId and string comparison
      if (topicInstructor._id) {
        return topicInstructor._id.toString() === instructorId;
      }
      return topicInstructor.toString() === instructorId;
    });

    // console.log('Query results:', { // Dòng này đã xóa
    //   totalTopics: allTopics.length,
    //   matchedTopics: matchedTopics.length,
    //   instructorId
    // });

    res.json(matchedTopics);
  } catch { // Đổi thành catch không có biến
    // console.error('Error in /instructor/:instructorId/all:', error); // Dòng này đã được xử lý catch không biến
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload outline (convert docx to pdf)
router.post('/:id/upload-outline', upload.single('file'), async (req, res) => {
  console.log(`topic.js: Hit POST /${req.params.id}/upload-outline`);
  try {
    const topicId = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    // Xóa file cũ nếu có
    const topicOld = await Topic.findById(topicId);
    if (topicOld && topicOld.topic_outline_file) {
      try {
        const oldPath = topicOld.topic_outline_file.replace(/^https?:\/\/[^/]+\//, '');
        if (oldPath.startsWith('uploads/')) {
          fs.unlinkSync(oldPath);
        }
      } catch { /* ignore */ } // Đổi thành catch không có biến
    }
    const docxBuf = fs.readFileSync(file.path);
    libre.convert(docxBuf, '.pdf', undefined, async (err, done) => {
      if (err) {
        fs.unlinkSync(file.path);
        return res.status(500).json({ message: 'Convert to PDF failed', error: err });
      }
      const pdfPath = path.join('uploads', `${file.filename}.pdf`);
      fs.writeFileSync(pdfPath, done);
      fs.unlinkSync(file.path);
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}.pdf`;
      const topic = await Topic.findByIdAndUpdate(
        topicId,
        { 
          topic_outline_file: fileUrl,
          topic_outline_file_original_name: file.originalname
        },
        { new: true }
      );
      res.json({ message: 'Upload and convert successful', file: fileUrl, originalName: file.originalname, topic });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Upload final report (convert docx to pdf)
router.post('/:id/upload-final', upload.single('file'), async (req, res) => {
  console.log(`topic.js: Hit POST /${req.params.id}/upload-final`);
  try {
    const topicId = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    // Xóa file cũ nếu có
    const topicOld = await Topic.findById(topicId);
    if (topicOld && topicOld.topic_final_report) {
      try {
        const oldPath = topicOld.topic_final_report.replace(/^https?:\/\/[^/]+\//, '');
        if (oldPath.startsWith('uploads/')) {
          fs.unlinkSync(oldPath);
        }
      } catch { /* ignore */ } // Đổi thành catch không có biến
    }
    const docxBuf = fs.readFileSync(file.path);
    libre.convert(docxBuf, '.pdf', undefined, async (err, done) => {
      if (err) {
        fs.unlinkSync(file.path);
        return res.status(500).json({ message: 'Convert to PDF failed', error: err });
      }
      const pdfPath = path.join('uploads', `${file.filename}.pdf`);
      fs.writeFileSync(pdfPath, done);
      fs.unlinkSync(file.path);
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}.pdf`;
      const topic = await Topic.findByIdAndUpdate(
        topicId,
        { 
          topic_final_report: fileUrl,
          topic_final_report_original_name: file.originalname
        },
        { new: true }
      );
      res.json({ message: 'Upload and convert successful', file: fileUrl, originalName: file.originalname, topic });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Giảng viên gửi duyệt đề tài (chuyển từ pending sang approved, leader là pending)
router.put('/:id/submit', async (req, res) => {
  console.log(`topic.js: Hit PUT /${req.params.id}/submit`);
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    if (topic.topic_teacher_status !== 'pending') {
      return res.status(400).json({ message: 'Đề tài không ở trạng thái chờ gửi duyệt' });
    }
    topic.topic_teacher_status = 'approved';
    topic.topic_leader_status = 'pending';
    await topic.save();
    res.json({ message: 'Đã gửi đề tài lên leader chờ duyệt', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi gửi duyệt đề tài', error: err.message });
  }
});

// Gán giảng viên phản biện cho đề tài
router.put('/:id/assign-reviewer', async (req, res) => {
  console.log(`topic.js: Hit PUT /${req.params.id}/assign-reviewer`);
  try {
    const { reviewerId } = req.body;
    console.log('[assign-reviewer] Nhận request:', { topicId: req.params.id, reviewerId });
    if (!reviewerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng chọn giảng viên phản biện' 
      });
    }

    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      console.log('[assign-reviewer] Không tìm thấy đề tài');
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy đề tài' 
      });
    }

    // Kiểm tra xem có GVPB cũ không
    const oldReviewer = topic.topic_reviewer;
    const newReviewer = await User.findById(reviewerId);
    if (!newReviewer) {
      console.log('[assign-reviewer] Không tìm thấy giảng viên phản biện');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên phản biện'
      });
    }

    // Cập nhật GVPB mới
    topic.topic_reviewer = reviewerId;
    const saved = await topic.save();
    if (!saved) {
      console.log('[assign-reviewer] Lưu đề tài thất bại');
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lưu đề tài, vui lòng thử lại.'
      });
    }
    await topic.populate('topic_reviewer', 'user_name user_id');

    // Tạo message phù hợp
    let message = '';
    if (oldReviewer) {
      const oldReviewerName = await User.findById(oldReviewer).select('user_name');
      message = `Đã cập nhật giảng viên phản biện từ ${oldReviewerName?.user_name || 'Chưa có'} thành ${newReviewer.user_name}`;
    } else {
      message = `Đã gán giảng viên phản biện: ${newReviewer.user_name}`;
    }

    console.log('[assign-reviewer] Thành công:', { topicId: topic._id, reviewer: topic.topic_reviewer });
    res.json({
      success: true,
      message,
      topic
    });
  } catch (err) {
    console.error('[assign-reviewer] Lỗi:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi gán giảng viên phản biện', 
      error: err.message 
    });
  }
});

// Lấy danh sách đề tài đã được giảng viên duyệt cho admin
router.get('/admin/topics', async (req, res) => {
  console.log('topic.js: Hit GET /admin/topics');
  try {
    const topics = await Topic.find({ topic_teacher_status: 'approved' })
      .populate('topic_instructor', 'user_name')
      .populate('topic_major', 'major_title')
      .populate('topic_category', 'topic_category_title');
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API lấy danh sách đề tài hướng dẫn cho giảng viên (chỉ lấy các status hợp lệ)
router.get('/supervised-topics', async (req, res) => {
  try {
    const topics = await Topic.find({
      topic_instructor: req.user._id,
      status: { $in: ['pending', 'waiting_admin', 'active'] }
    });
    const validStatuses = ['pending', 'waiting_admin', 'active'];
    const filteredTopics = topics.filter(topic => validStatuses.includes(topic.status));
    res.json(filteredTopics);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đề tài hướng dẫn', error: err.message });
  }
});

// API giảng viên từ chối đề xuất
router.put('/:id/reject-by-lecturer', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    topic.topic_teacher_status = 'rejected';
    topic.status = 'rejected';
    topic.reject_reason = reason || '';
    await topic.save();

    // Log giá trị trước khi tạo notification
    // console.log('Tạo notification cho sinh viên:', { sender: req.user?._id, recipient: topic.topic_creator, topicId: topic._id, reason });

    // Gửi notification cho sinh viên
    let recipientId = topic.topic_creator;
    const mongoose = require('mongoose');
    if (!recipientId) {
      console.error('topic_creator is null or undefined for topic:', topic._id);
      return res.status(400).json({ message: 'Không tìm thấy sinh viên nhận thông báo!' });
    }
    if (typeof recipientId === 'string') {
      if (mongoose.Types.ObjectId.isValid(recipientId)) {
        recipientId = new mongoose.Types.ObjectId(recipientId);
      } else {
        console.error('topic_creator không phải là ObjectId hợp lệ:', recipientId);
        // Vẫn cho phép từ chối đề tài, chỉ không gửi notification
        return res.json({ message: 'Đã từ chối đề tài (không gửi được thông báo do topic_creator không hợp lệ)', topic });
      }
    }

    try {
      const notification = await UserNotification.create({
        user_notification_title: 'Đề tài bị từ chối',
        user_notification_sender: req.user?._id,
        user_notification_recipient: recipientId,
        user_notification_content: `Đề tài "${topic.topic_title}" đã bị từ chối. Lý do: ${reason || 'Không có lý do cụ thể.'}`,
        user_notification_type: 2,
        user_notification_isRead: false,
        user_notification_topic: 'topic',
      });
      console.log('Notification đã tạo:', notification);
    } catch (err) {
      console.error('Lỗi khi tạo notification:', err);
    }

    res.json({ message: 'Đã từ chối đề tài và gửi thông báo cho sinh viên', topic });
  } catch (err) {
    console.error('Lỗi khi từ chối đề tài:', err);
    res.status(500).json({ message: 'Lỗi khi từ chối đề tài', error: err.message });
  }
});

// Đề xuất lại đề tài bị từ chối (resubmit)
router.put('/:id/resubmit', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });

    // Chỉ cho phép resubmit nếu đề tài đang bị từ chối
    if (topic.status !== 'rejected' && topic.topic_teacher_status !== 'rejected') {
      return res.status(400).json({ message: 'Chỉ có thể đề xuất lại đề tài đã bị từ chối' });
    }

    // Cập nhật lại các trường
    topic.topic_title = req.body.topic_title;
    topic.topic_description = req.body.topic_description;
    topic.topic_category = req.body.topic_category;
    topic.topic_major = req.body.topic_major;
    topic.topic_instructor = req.body.topic_instructor;
    topic.topic_max_members = req.body.topic_max_members;
    topic.topic_group_student = req.body.topic_group_student;
    // Reset trạng thái
    topic.topic_teacher_status = 'pending';
    topic.topic_leader_status = 'pending';
    topic.status = 'pending';
    topic.topic_block = false;
    topic.reject_reason = '';
    // Cập nhật file advisor request mới nếu có
    if (req.body.topic_advisor_request) {
      topic.topic_advisor_request = req.body.topic_advisor_request;
    }
    await topic.save();

    res.json({ message: 'Đề xuất lại đề tài thành công', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi đề xuất lại đề tài', error: err.message });
  }
});

// Upload advisor request (convert docx to pdf, không cần topicId)
router.post('/upload-advisor-request', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    let ext = path.extname(file.originalname).toLowerCase();
    let pdfFilename = file.filename.endsWith('.pdf') ? file.filename : `${file.filename}.pdf`;
    let pdfPath = path.join('uploads', pdfFilename);
    if (ext === '.pdf') {
      // Nếu là PDF nhưng tên file chưa có .pdf thì thêm vào
      if (!file.path.endsWith('.pdf')) {
        fs.renameSync(file.path, pdfPath);
      } else {
        pdfPath = file.path;
      }
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${pdfFilename}`;
      return res.json({ file: fileUrl, originalName: file.originalname });
    }
    // Nếu là doc/docx thì convert
    const docxBuf = fs.readFileSync(file.path);
    libre.convert(docxBuf, '.pdf', undefined, (err, done) => {
      if (err) {
        fs.unlinkSync(file.path);
        return res.status(500).json({ message: 'Convert to PDF failed', error: err });
      }
      fs.writeFileSync(pdfPath, done);
      fs.unlinkSync(file.path);
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${pdfFilename}`;
      res.json({ file: fileUrl, originalName: file.originalname.replace(/\.[^/.]+$/, '') + '.pdf' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router; 