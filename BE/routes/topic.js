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
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ storage: storage });


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
    const { facultyId } = req.query;
    let majorIds = [];
    if (facultyId) {
      // Lấy tất cả major thuộc facultyId
      const majors = await Major.find({ major_faculty: facultyId }, '_id');
      majorIds = majors.map(m => m._id);
    }
    const topicQuery = {
      status: { $in: ['active', 'pending'] }
    };
    if (facultyId && majorIds.length > 0) {
      topicQuery.topic_major = { $in: majorIds };
    }
    const topics = await Topic.find(topicQuery)
      .populate('topic_instructor', 'user_name user_id')
      .populate('topic_major', 'major_title major_faculty')
      .populate('topic_category', 'topic_category_title')
      .populate('topic_registration_period', 'semester title')
      .populate('topic_group_student', 'user_name user_id');
    res.json({ success: true, data: topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy chi tiết đề tài theo ID
router.get('/:id', async (req, res) => {
  try {
    // Kiểm tra xem id có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID đề tài không hợp lệ' });
    }

    const topic = await Topic.findById(req.params.id)
      .populate('topic_instructor', 'user_name user_id')
      .populate('topic_major', 'major_title')
      .populate('topic_category', 'topic_category_title')
      .populate({
        path: 'topic_group_student',
        select: 'user_name user_id email user_date_of_birth user_CCCD user_avatar user_phone user_permanent_address user_temporary_address user_major user_faculty user_status user_gpa user_transcript',
        populate: [
          { path: 'user_major', select: 'major_title' },
          { path: 'user_faculty', select: 'faculty_title', model: 'Faculty' }
        ]
      })
      .populate('topic_creator', 'user_name user_id role')
      .populate({ path: 'topic_assembly', model: 'Council', select: 'assembly_name' });
    if (!topic) {
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
        user_name: student.user_name,
        email: student.email,
        user_date_of_birth: student.user_date_of_birth,
        user_CCCD: student.user_CCCD,
        user_avatar: student.user_avatar,
        user_phone: student.user_phone,
        user_permanent_address: student.user_permanent_address,
        user_temporary_address: student.user_temporary_address,
        user_major: student.user_major?.major_title || student.user_major || '',
        user_faculty: student.user_faculty || '',
        user_status: student.user_status,
        user_gpa: student.user_gpa,
        user_transcript: student.user_transcript
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
router.post('/:id/register', upload.single('advisor_request'), async (req, res) => {
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
      'topic_group_student': studentId,
      status: { $in: ['pending', 'waiting', 'active'] }
    });
    if (existingTopic) {
      return res.status(400).json({ 
        message: `Sinh viên ${leader.user_name} (${leader.user_id}) đã có đề tài "${existingTopic.topic_title}" ở trạng thái "${existingTopic.status}". Không thể ghi danh đề tài khác.` 
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

    // Xử lý file advisor_request nếu có
    let advisorRequestUrl = topic.topic_advisor_request;
    if (req.file) {
      advisorRequestUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (req.body.advisor_request) {
      advisorRequestUrl = req.body.advisor_request;
    }

    // Cập nhật topic
    topic.topic_group_student = memberIds;
    topic.topic_teacher_status = 'pending';
    topic.topic_leader_status = 'pending';
    topic.status = 'pending';
    topic.topic_advisor_request = advisorRequestUrl;
    if (memberIds.length >= topic.topic_max_members) {
      topic.topic_block = true;
    }
    // Đảm bảo rejectType là register
    topic.rejectType = 'register';
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
router.post('/propose', async (req, res) => {
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
      topic_creator,
      topic_advisor_request
    } = req.body;

    console.log('Received proposal data:', req.body);

    // Đảm bảo topic_group_student luôn là mảng
    const safe_group_student = Array.isArray(topic_group_student) ? topic_group_student : [];

    // Lấy ra creatorRole trước
    const creatorUser = await User.findById(topic_creator);
    const creatorRole = creatorUser?.role || 'sinhvien';

    // Kiểm tra các trường bắt buộc
    if (
      !topic_title ||
      !topic_instructor ||
      !topic_major ||
      !topic_category ||
      !topic_description ||
      !topic_max_members ||
      !topic_creator ||
      (creatorRole === 'sinhvien' && !topic_advisor_request) // chỉ bắt buộc với sinh viên
    ) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin đề tài' + (creatorRole === 'sinhvien' ? ' và tải lên file đơn xin hướng dẫn.' : '.'),
        missingFields: {
          topic_title: !topic_title,
          topic_instructor: !topic_instructor,
          topic_major: !topic_major,
          topic_category: !topic_category,
          topic_description: !topic_description,
          topic_max_members: !topic_max_members,
          topic_creator: !topic_creator,
          topic_advisor_request: creatorRole === 'sinhvien' ? !topic_advisor_request : false
        }
      });
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

    // Kiểm tra từng thành viên trong topic_group_student đã có đề tài được duyệt chưa
    for (const memberId of safe_group_student) {
      const busyTopic = await Topic.findOne({
        topic_group_student: memberId,
        $or: [
          { topic_teacher_status: { $in: ['approved', 'waiting', 'pending'] } },
          { status: { $in: ['active', 'pending', 'waiting'] } }
        ]
      }).populate('topic_group_student', 'user_name user_id');
      if (busyTopic) {
        // Lấy thông tin thành viên
        const member = busyTopic.topic_group_student.find(m => m._id.toString() === memberId.toString());
        const memberName = member?.user_name || 'Không rõ';
        const memberCode = member?.user_id || '';
        return res.status(400).json({
          message: `Thành viên ${memberName} (${memberCode}) đã có đề tài \"${busyTopic.topic_title}\" ở trạng thái đang thực hiện hoặc chờ duyệt. Không thể đề xuất đề tài mới.`
        });
      }
    }

    // Tạo đề tài mới
    const newTopic = new Topic({
      topic_title,
      topic_instructor,
      topic_major,
      topic_category,
      topic_description,
      topic_max_members,
      topic_group_student: Array.isArray(topic_group_student) ? topic_group_student : [],
      topic_creator,
      topic_teacher_status: creatorRole === 'giangvien' ? 'draft' : 'pending', // Giảng viên tạo thì là draft
      topic_leader_status: 'pending',
      topic_block: false,
      status: creatorRole === 'giangvien' ? 'draft' : 'pending', // Giảng viên tạo thì là draft
      topic_advisor_request,
      rejectType: 'proposal' // Đảm bảo đề xuất luôn là proposal
    });

    await newTopic.save();

    console.log('Creating notification for instructor:', {
      sender: topic_creator,
      recipient: topic_instructor,
      title: topic_title
    });

    // Xác định vai trò người tạo đề tài
    let notificationContent = '';
    if (creatorRole === 'sinhvien') {
      notificationContent = `Sinh viên đã đề xuất đề tài mới: "${topic_title}". Vui lòng kiểm tra và duyệt đề tài trong mục "Đề tài sinh viên đề xuất"!`;
    try {
      const notification = await UserNotification.create({
        user_notification_title: 'Đề xuất đề tài mới',
          user_notification_sender: topic_creator,
          user_notification_recipient: topic_instructor,
          user_notification_content: notificationContent,
        user_notification_type: 2,
        user_notification_isRead: false,
        user_notification_topic: 'topic',
      });
      console.log('Notification created successfully:', notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      }
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
  try {
    // Lấy cả đề tài sinh viên đề xuất (luồng cũ) và đề tài sinh viên đăng ký đề tài có sẵn (luồng mới)
    const topics = await Topic.find({
      topic_instructor: req.params.instructorId,
      status: 'pending',
      $or: [
        // Luồng cũ: đề xuất đề tài
        {
          topic_teacher_status: { $in: ['pending', 'waiting'] },
          topic_leader_status: { $in: ['pending', 'approved'] },
          topic_creator: { $exists: true, $ne: null }
        },
        // Luồng mới: đăng ký đề tài có sẵn
        {
          topic_teacher_status: 'waiting',
          topic_leader_status: 'approved',
          topic_group_student: { $exists: true, $not: { $size: 0 } }
        }
      ]
    })
    .populate('topic_group_student', 'user_name user_id')
    .populate('topic_major', 'major_title')
    .populate('topic_category', 'topic_category_title')
    .populate('topic_creator', 'role')
    .sort({ createdAt: -1 });

    res.json(topics);
  } catch (err) {
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
    // Xác định rejectType: nếu có topic_creator và không có group_student => proposal, ngược lại là register
    if (topic.topic_creator && (!topic.topic_group_student || topic.topic_group_student.length === 0)) {
      topic.rejectType = 'proposal';
    } else {
      topic.rejectType = 'register';
    }
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
        return res.json({ message: 'Đã từ chối đề tài (không gửi được thông báo do topic_creator không hợp lệ)', topic, rejectType: topic.rejectType });
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

    if (topic.rejectType === 'register' && topic.topic_group_student && topic.topic_group_student.length > 0) {
      // Gửi thông báo cho từng sinh viên trong nhóm
      const notifications = topic.topic_group_student.map(studentId => ({
        user_notification_title: 'Đề tài ghi danh bị từ chối',
        user_notification_sender: req.user?._id,
        user_notification_recipient: studentId,
        user_notification_content: `Đề tài "${topic.topic_title}" bạn ghi danh đã bị từ chối. Lý do: ${req.body.reason || 'Không có lý do cụ thể.'}`,
        user_notification_type: 2,
        user_notification_isRead: false,
        user_notification_topic: 'topic',
      }));
      await UserNotification.insertMany(notifications);
    } else if (topic.rejectType === 'proposal') {
      // Luồng đề xuất: giữ nguyên như cũ (gửi cho topic_creator)
      // ... (đã có sẵn)
    }

    res.json({ message: 'Đã từ chối đề tài và gửi thông báo cho sinh viên', topic, rejectType: topic.rejectType });
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

    // Nếu là đề tài có sẵn (không phải đề xuất của sinh viên), cập nhật trạng thái để cho phép ghi danh lại
    // Dựa vào rejectType='register' để phân biệt luồng ghi danh
    // Note: Logic hiện tại dựa vào creatorRole. Nếu creatorRole không phải sinhvien, tức là đề tài có sẵn.
    // Cập nhật trạng thái theo yêu cầu mới:
    topic.topic_group_student = [];
    topic.topic_teacher_status = 'approved'; // Set về approved
    topic.topic_leader_status = 'approved'; // Set về approved
    topic.status = 'pending'; // Set về pending (cho phép đăng ký lại)
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

// Upload defense request (convert docx to pdf, lưu vào topic_defense_request)
router.post('/:id/upload-defense-request', upload.single('file'), async (req, res) => {
  console.log(`topic.js: Hit POST /${req.params.id}/upload-defense-request`);
  try {
    const topicId = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    // Xóa file cũ nếu có
    const topicOld = await Topic.findById(topicId);
    if (topicOld && topicOld.topic_defense_request && topicOld.topic_defense_request.startsWith('http')) {
      try {
        const oldPath = topicOld.topic_defense_request.replace(/^https?:\/\/[^/]+\//, '');
        if (oldPath.startsWith('uploads/')) {
          fs.unlinkSync(oldPath);
        }
      } catch { /* ignore */ }
    }
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') {
      // Nếu là PDF thì lưu luôn
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      const topic = await Topic.findByIdAndUpdate(
        topicId,
        {
          topic_defense_request: fileUrl,
          topic_defense_request_original_name: file.originalname
        },
        { new: true }
      );
      return res.json({ message: 'Upload PDF thành công', file: fileUrl, originalName: file.originalname, topic });
    }
    // Nếu là doc/docx thì convert
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
          topic_defense_request: fileUrl,
          topic_defense_request_original_name: file.originalname.replace(/\.[^/.]+$/, '') + '.pdf'
        },
        { new: true }
      );
      res.json({ message: 'Upload and convert successful', file: fileUrl, originalName: file.originalname.replace(/\.[^/.]+$/, '') + '.pdf', topic });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Upload final report (convert docx to pdf, lưu vào topic_final_report và topic_final_report_file)
router.post('/:id/upload-final', upload.single('file'), async (req, res) => {
  console.log(`topic.js: Hit POST /${req.params.id}/upload-final`);
  try {
    const topicId = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    // Xóa file cũ nếu có (chỉ xóa file cũ ở topic_final_report_file)
    const topicOld = await Topic.findById(topicId);
    if (topicOld && topicOld.topic_final_report_file && topicOld.topic_final_report_file.startsWith('http')) {
      try {
        const oldPath = topicOld.topic_final_report_file.replace(/^https?:\/\/[^/]+\//, '');
        if (oldPath.startsWith('uploads/')) {
          fs.unlinkSync(oldPath);
        }
      } catch { /* ignore */ }
    }
    const ext = path.extname(file.originalname).toLowerCase();
    let fileUrl = '';
    let originalName = '';
    if (ext === '.pdf') {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      originalName = file.originalname;
      await Topic.findByIdAndUpdate(
        topicId,
        {
          topic_final_report: fileUrl, // vẫn cập nhật như cũ
          topic_final_report_file: fileUrl, // luôn lưu link file
          topic_final_report_original_name: file.originalname
        },
        { new: true }
      );
      return res.json({ message: 'Upload PDF thành công', file: fileUrl, originalName: file.originalname });
    }
    // Nếu là doc/docx thì convert
    const docxBuf = fs.readFileSync(file.path);
    libre.convert(docxBuf, '.pdf', undefined, async (err, done) => {
      if (err) {
        fs.unlinkSync(file.path);
        return res.status(500).json({ message: 'Convert to PDF failed', error: err });
      }
      const pdfPath = path.join('uploads', `${file.filename}.pdf`);
      fs.writeFileSync(pdfPath, done);
      fs.unlinkSync(file.path);
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}.pdf`;
      originalName = file.originalname.replace(/\.[^/.]+$/, '') + '.pdf';
      await Topic.findByIdAndUpdate(
        topicId,
        {
          topic_final_report: fileUrl, // vẫn cập nhật như cũ
          topic_final_report_file: fileUrl, // luôn lưu link file
          topic_final_report_original_name: originalName
        },
        { new: true }
      );
      res.json({ message: 'Upload and convert successful', file: fileUrl, originalName, topicId });
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
    // Xác định rejectType: nếu có topic_creator và không có group_student => proposal, ngược lại là register
    if (topic.topic_creator && (!topic.topic_group_student || topic.topic_group_student.length === 0)) {
      topic.rejectType = 'proposal';
    } else {
      topic.rejectType = 'register';
    }
    await topic.save();

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
        return res.json({ message: 'Đã từ chối đề tài (không gửi được thông báo do topic_creator không hợp lệ)', topic, rejectType: topic.rejectType });
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

    if (topic.rejectType === 'register' && topic.topic_group_student && topic.topic_group_student.length > 0) {
      // Gửi thông báo cho từng sinh viên trong nhóm
      const notifications = topic.topic_group_student.map(studentId => ({
        user_notification_title: 'Đề tài ghi danh bị từ chối',
        user_notification_sender: req.user?._id,
        user_notification_recipient: studentId,
        user_notification_content: `Đề tài "${topic.topic_title}" bạn ghi danh đã bị từ chối. Lý do: ${reason || 'Không có lý do cụ thể.'}`,
        user_notification_type: 2,
        user_notification_isRead: false,
        user_notification_topic: 'topic',
      }));
      await UserNotification.insertMany(notifications);
    } else if (topic.rejectType === 'proposal') {
      // Luồng đề xuất: giữ nguyên như cũ (gửi cho topic_creator)
      // ... (đã có sẵn)
    }

    res.json({ message: 'Đã từ chối đề tài và gửi thông báo cho sinh viên', topic, rejectType: topic.rejectType });
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

// Delete topic
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Delete topic request:', {
      topicId: req.params.id,
      userId: req.user._id,
      userRole: req.user.role
    });

    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      console.log('Topic not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Không tìm thấy đề tài để xóa' });
    }

    // Kiểm tra quyền xóa
    const isInstructor = topic.topic_instructor && topic.topic_instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    console.log('Permission check:', {
      isInstructor,
      isAdmin,
      topicTeacherStatus: topic.topic_teacher_status,
      topicLeaderStatus: topic.topic_leader_status
    });

    // Nếu đã được cả giảng viên và leader duyệt
    if (topic.topic_teacher_status === 'approved' && topic.topic_leader_status === 'approved') {
      // Chỉ admin mới có quyền xóa
      if (!isAdmin) {
        // Nếu là giảng viên, gửi yêu cầu xóa cho admin
        if (isInstructor) {
          topic.delete_request = true;
          topic.delete_reason = req.body.delete_reason || '';
          await topic.save();

          // Tìm user admin
          const adminUser = await User.findOne({ role: 'giaovu' });
          if (adminUser) {
            await UserNotification.create({
              user_notification_title: 'Yêu cầu xóa đề tài',
              user_notification_sender: req.user._id,
              user_notification_recipient: adminUser._id,
              user_notification_content: `Giảng viên yêu cầu xóa đề tài "${topic.topic_title}". Lý do: ${req.body.delete_reason || 'Không có lý do.'}`,
              user_notification_type: 2,
              user_notification_isRead: false,
              user_notification_topic: 'topic',
            });
          }

          return res.json({ success: true, message: 'Đã gửi yêu cầu xóa cho admin.' });
        }
        return res.status(403).json({ success: false, message: 'Không có quyền xóa đề tài này.' });
      }
    }

    // Nếu giảng viên đã từ chối đề tài, cho phép xóa luôn
    if (topic.topic_teacher_status === 'rejected' && isInstructor) {
      await Topic.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Xóa đề tài thành công.' });
    }

    // Nếu leader chưa duyệt, cho phép giảng viên xóa
    if (topic.topic_leader_status === 'pending' && isInstructor) {
      await Topic.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Xóa đề tài thành công.' });
    }

    // Admin có thể xóa bất kỳ đề tài nào
    if (isAdmin) {
      await Topic.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Xóa đề tài thành công.' });
    }

    console.log('No permission to delete topic');
    res.status(403).json({ success: false, message: 'Không có quyền xóa đề tài này.' });
  } catch (err) {
    console.error('Error deleting topic:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa đề tài', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Admin duyệt yêu cầu xóa đề tài
router.post('/:id/approve-delete', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic || !topic.delete_request) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đề tài chờ xóa' });
    }
    await Topic.findByIdAndDelete(req.params.id);

    // Gửi notification cho giảng viên
    await UserNotification.create({
      user_notification_title: 'Yêu cầu xóa đề tài được duyệt',
      user_notification_sender: req.user?._id, // id admin
      user_notification_recipient: topic.topic_instructor, // id giảng viên
      user_notification_content: `Yêu cầu xóa đề tài "${topic.topic_title}" của bạn đã được duyệt thành công.`,
      user_notification_type: 2,
      user_notification_isRead: false,
      user_notification_topic: 'topic',
    });

    res.json({ success: true, message: 'Đã xóa đề tài.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi duyệt xóa đề tài', error: err.message });
  }
});

// Admin từ chối yêu cầu xóa đề tài
router.post('/:id/reject-delete', auth, async (req, res) => {
  try {
    const { reject_reason } = req.body;
    const topic = await Topic.findById(req.params.id);
    if (!topic || !topic.delete_request) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đề tài chờ xóa' });
    }
    topic.delete_request = false;
    topic.delete_reason = '';
    await topic.save();

    // Gửi notification cho giảng viên
    await UserNotification.create({
      user_notification_title: 'Yêu cầu xóa đề tài bị từ chối',
      user_notification_sender: req.user?._id, // id admin
      user_notification_recipient: topic.topic_instructor, // id giảng viên
      user_notification_content: `Yêu cầu xóa đề tài "${topic.topic_title}" bị từ chối. Lý do: ${reject_reason || 'Không có lý do.'}`,
      user_notification_type: 2,
      user_notification_isRead: false,
      user_notification_topic: 'topic',
    });

    res.json({ success: true, message: 'Đã từ chối đề tài và gửi thông báo cho sinh viên', topic, rejectType: topic.rejectType });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi từ chối xóa đề tài', error: err.message });
  }
});

// Duyệt hoặc từ chối đề cương
router.put('/:id/approve-outline', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    topic.topic_defense_request = req.body.status; // 'Đã chấp nhận' hoặc 'Từ chối: <lý do>'
    await topic.save();
    res.json({ message: 'Cập nhật trạng thái đề cương thành công', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đề cương', error: err.message });
  }
});

// Duyệt hoặc từ chối báo cáo cuối cùng
router.put('/:id/approve-final', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    topic.topic_final_report = req.body.status; // 'Đã chấp nhận' hoặc 'Từ chối: <lý do>'
    await topic.save();
    res.json({ message: 'Cập nhật trạng thái báo cáo cuối cùng thành công', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái báo cáo cuối cùng', error: err.message });
  }
});

// Cập nhật đề tài theo id
router.put('/:id', async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!topic) {
      return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    }
    res.json({ message: 'Cập nhật đề tài thành công', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật đề tài', error: err.message });
  }
});

// Ghi danh đề tài (luồng mới)
router.post('/:id/register-v2', upload.single('advisor_request'), async (req, res) => {
  try {
    console.log('Body:', req.body);
    console.log('File:', req.file);
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });

    const { studentId, ...otherMembers } = req.body;
    if (!studentId) return res.status(400).json({ message: 'Thiếu thông tin người đăng ký' });
    const leader = await User.findById(studentId);
    if (!leader) return res.status(400).json({ message: 'Không tìm thấy thông tin người đăng ký' });

    // Kiểm tra nếu đề tài bị block, trừ khi người đăng ký là thành viên cũ
    const isOldMember = topic.topic_group_student?.some(
      memberId => memberId.toString() === studentId.toString()
    );
    if (topic.topic_block && !isOldMember) {
      return res.status(400).json({ message: 'Đề tài đã bị khóa' });
    }

    // Thu thập tất cả thành viên
    const memberIds = [studentId];
    for (let i = 2; i <= topic.topic_max_members; i++) {
      const memberId = otherMembers[`member${i}Id`];
      if (memberId) {
        const member = await User.findById(memberId);
        if (!member) return res.status(400).json({ message: `Không tìm thấy thành viên ${i}` });
        if (member.role !== 'sinhvien') return res.status(400).json({ message: `Thành viên ${i} không phải là sinh viên` });
        memberIds.push(memberId);
      }
    }
    // Kiểm tra số lượng thành viên
    if (memberIds.length > topic.topic_max_members) {
      return res.status(400).json({ message: `Số lượng thành viên vượt quá giới hạn cho phép (tối đa ${topic.topic_max_members} người)` });
    }
    // Kiểm tra trùng thành viên
    const uniqueMembers = [...new Set(memberIds)];
    if (uniqueMembers.length !== memberIds.length) {
      return res.status(400).json({ message: 'Không được chọn trùng thành viên' });
    }
    // Kiểm tra đăng ký trùng
    const existingRegistrations = await Topic.find({
      _id: { $ne: req.params.id }, // Loại trừ đề tài hiện tại
      'topic_group_student': { $in: memberIds }
    });
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

    // Xử lý file advisor_request
    let advisorRequestUrl = topic.topic_advisor_request;
    if (req.file) {
      // Nếu có file upload mới
      advisorRequestUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (req.body.advisor_request) {
      // Nếu có URL file từ trước
      advisorRequestUrl = req.body.advisor_request;
    }

    // Cập nhật topic
    topic.topic_group_student = memberIds;
    topic.topic_teacher_status = 'waiting';
    topic.topic_leader_status = 'approved';
    topic.status = 'pending';
    topic.topic_advisor_request = advisorRequestUrl;
    if (memberIds.length >= topic.topic_max_members) {
      topic.topic_block = true;
    }
    // Đảm bảo rejectType là register
    topic.rejectType = 'register';
    await topic.save();
    await topic.populate('topic_group_student', 'user_name user_id');

    // Gửi thông báo cho giảng viên
    await UserNotification.create({
      user_notification_title: 'Nhóm sinh viên đăng ký đề tài',
      user_notification_sender: studentId,
      user_notification_recipient: topic.topic_instructor,
      user_notification_content: `Nhóm sinh viên vừa đăng ký đề tài "${topic.topic_title}". Vui lòng kiểm tra!`,
      user_notification_type: 2,
      user_notification_isRead: false,
      user_notification_topic: 'topic',
    });

    res.json({ message: 'Đăng ký thành công (luồng mới)', topic });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Có lỗi xảy ra khi đăng ký đề tài (luồng mới)', error: err.message });
  }
});

// Giảng viên duyệt đề tài (luồng mới)
router.put('/:id/approve-by-lecturer-v2', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    topic.topic_teacher_status = 'approve';
    topic.topic_leader_status = 'waiting';
    topic.status = 'pending';
    await topic.save();
    res.json({ message: 'Giảng viên đã duyệt đề tài (luồng mới)', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi giảng viên duyệt đề tài (luồng mới)', error: err.message });
  }
});



// Lấy danh sách đề tài chờ admin duyệt
router.get('/admin/pending-topics', async (req, res) => {
  try {
    const topics = await Topic.find({
      topic_teacher_status: 'approve',
      topic_leader_status: { $in: ['pending', 'waiting'] },
      status: 'pending'
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

// API reset đề tài về trạng thái cho phép ghi danh lại
router.post('/:id/reset-for-new-registration', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    topic.topic_group_student = [];
    topic.topic_teacher_status = 'approved';
    topic.topic_leader_status = 'approved';
    topic.status = 'pending';
    topic.topic_block = false;
    await topic.save();
    res.json({ message: 'Đề tài đã được reset, có thể ghi danh lại.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi reset đề tài', error: err.message });
  }
});

// Giảng viên gửi đăng ký đề tài (từ draft sang chờ admin duyệt)
router.put('/:id/submit-by-lecturer', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    if (topic.status !== 'draft') {
      return res.status(400).json({ message: 'Chỉ có thể gửi đăng ký từ trạng thái nháp' });
    }
    topic.status = 'waiting_admin'; // chuyển sang chờ admin duyệt
    topic.topic_teacher_status = 'approved'; // giảng viên đã duyệt
    await topic.save();
    res.json({ message: 'Đã gửi đăng ký đề tài lên admin', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi gửi đăng ký đề tài', error: err.message });
  }
});

// Admin duyệt đề tài
router.put('/:id/approve-by-admin', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    if (topic.status !== 'waiting_admin') {
      return res.status(400).json({ message: 'Chỉ có thể duyệt đề tài đang chờ admin duyệt' });
    }
    topic.status = 'pending'; // Cho phép sinh viên đăng ký
    topic.topic_teacher_status = 'approved';
    topic.topic_leader_status = 'approved';
    await topic.save();
    res.json({ message: 'Admin đã duyệt đề tài thành công', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi admin duyệt đề tài', error: err.message });
  }
});

module.exports = router;