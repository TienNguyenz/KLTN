const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const User = require('../models/User');
const Major = require('../models/Major');
const TopicType = require('../models/TopicType');
const UserNotification = require('../models/UserNotification');
const mongoose = require('mongoose');

// Lấy tất cả đề tài (chỉ trả về đề tài đã được duyệt bởi cả giảng viên và admin)
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find({
      topic_teacher_status: 'approved',
      topic_admin_status: 'approved'
    })
      .populate('topic_instructor', 'user_name')
      .populate('topic_major', 'major_name')
      .populate('topic_category', 'type_name')
      .populate('topic_group_student', 'user_name user_id');
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách loại đề tài
router.get('/topic-types', async (req, res) => {
  try {
    const types = await TopicType.find();
    res.json(types);
  } catch (err) {
    console.error('Error fetching topic types:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lấy chi tiết đề tài theo ID
router.get('/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('topic_instructor', 'user_name user_id')
      .populate('topic_major', 'major_title')
      .populate('topic_category', 'topic_category_title')
      .populate('topic_group_student', 'user_name user_id')
      .populate('topic_creator', 'user_name user_id role');
    
    if (!topic) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đề tài' 
      });
    }

    // Format response data
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
      topic_group_student: topic.topic_group_student.map(student => ({
        name: student.user_name,
        id: student.user_id
      })),
      topic_creator: topic.topic_creator ? {
        name: topic.topic_creator.user_name,
        id: topic.topic_creator.user_id,
        role: topic.topic_creator.role
      } : null
    };

    res.json({
      success: true,
      data: formattedTopic
    });
  } catch (err) {
    console.error('Error fetching topic details:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy thông tin đề tài',
      error: err.message 
    });
  }
});

// Đăng ký đề tài
router.post('/:id/register', async (req, res) => {
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
    const memberPromises = [];

    // Xử lý các thành viên khác
    for (let i = 2; i <= topic.topic_max_members; i++) {
      const memberId = otherMembers[`member${i}Id`];
      if (memberId) {
        memberPromises.push(
          User.findById(memberId).then(member => {
            if (!member) {
              throw new Error(`Không tìm thấy thành viên ${i}`);
            }
            if (member.role !== 'sinhvien') {
              throw new Error(`Thành viên ${i} không phải là sinh viên`);
            }
            memberIds.push(memberId);
          })
        );
      }
    }

    // Đợi tất cả các promise kiểm tra thành viên hoàn thành
    await Promise.all(memberPromises);

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

    // Validate required fields
    if (!topic_title || !topic_instructor || !topic_major || 
        !topic_category || !topic_description || !topic_max_members || 
        !topic_group_student || !topic_creator) {
      return res.status(400).json({ 
        message: 'Vui lòng điền đầy đủ thông tin đề tài.',
        missingFields: {
          topic_title: !topic_title,
          topic_instructor: !topic_instructor,
          topic_major: !topic_major,
          topic_category: !topic_category,
          topic_description: !topic_description,
          topic_max_members: !topic_max_members,
          topic_group_student: !topic_group_student,
          topic_creator: !topic_creator
        }
      });
    }

    // Kiểm tra xem các thành viên đã có đề tài chưa
    const existingTopics = await Topic.find({
      'topic_group_student': { $in: topic_group_student }
    }).populate('topic_group_student', 'user_name user_id');

    if (existingTopics.length > 0) {
      const registeredMembers = existingTopics
        .map(t => t.topic_group_student)
        .flat()
        .filter(member => topic_group_student.includes(member._id.toString()));

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
    if (topic_group_student.length > topic_max_members) {
      return res.status(400).json({ 
        message: `Số lượng thành viên vượt quá giới hạn cho phép (tối đa ${topic_max_members} người).` 
      });
    }

    // Check for duplicate members
    const uniqueMembers = [...new Set(topic_group_student)];
    if (uniqueMembers.length !== topic_group_student.length) {
      return res.status(400).json({ message: 'Không được chọn trùng thành viên.' });
    }

    try {
      // Check if members exist and are students
      const memberPromises = topic_group_student.map(async (memberId) => {
        console.log('Checking member:', memberId);
        const member = await User.findById(memberId);
        if (!member) {
          throw new Error(`Không tìm thấy thông tin thành viên với ID ${memberId}`);
        }
        if (member.role !== 'sinhvien') {
          throw new Error(`Thành viên ${member.user_name} không phải là sinh viên`);
        }
        return member;
      });

      await Promise.all(memberPromises);

      // Check if instructor exists and is a lecturer
      console.log('Checking instructor:', topic_instructor);
      const instructor = await User.findById(topic_instructor);
      if (!instructor) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin giảng viên hướng dẫn.' });
      }
      if (instructor.role !== 'giangvien') {
        return res.status(400).json({ message: 'Người được chọn không phải là giảng viên.' });
      }

      // Check if major exists
      console.log('Checking major:', topic_major);
      const major = await Major.findById(topic_major);
      if (!major) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin chuyên ngành.' });
      }

      // Check if topic type exists
      console.log('Checking topic type:', topic_category);
      const topicType = await TopicType.findById(topic_category);
      if (!topicType) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin loại đề tài.' });
      }

      // Check if any member is already in another topic
      const existingRegistrations = await Topic.find({
        'topic_group_student': { $in: topic_group_student }
      }).populate('topic_group_student', 'user_name user_id');

      if (existingRegistrations.length > 0) {
        const registeredMembers = existingRegistrations
          .map(t => t.topic_group_student)
          .flat()
          .filter(member => topic_group_student.includes(member._id.toString()));

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

      // Create new topic with only required fields
      const newTopic = new Topic({
        topic_title,
        topic_instructor,
        topic_major,
        topic_category,
        topic_description,
        topic_max_members,
        topic_group_student,
        topic_creator,
        topic_teacher_status: 'pending',
        topic_admin_status: 'pending',
        topic_leader_status: 'pending',
        topic_block: false
      });

      console.log('Creating new topic:', newTopic);

      await newTopic.save();

      // Populate the saved topic with related data
      await newTopic.populate([
        { path: 'topic_instructor', select: 'user_name user_id' },
        { path: 'topic_major', select: 'major_title' },
        { path: 'topic_category', select: 'topic_category_title' },
        { path: 'topic_group_student', select: 'user_name user_id' }
      ]);

      console.log('Topic created successfully:', newTopic);

      res.status(201).json({
        message: 'Đề xuất đề tài thành công.',
        topic: newTopic
      });

    } catch (error) {
      console.error('Validation error:', error);
      return res.status(400).json({
        message: error.message || 'Có lỗi xảy ra khi kiểm tra thông tin đề tài.'
      });
    }

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
    console.log('API gọi với instructorId:', req.params.instructorId);
    const topics = await Topic.find({
      topic_instructor: req.params.instructorId,
      topic_teacher_status: 'pending',
      topic_leader_status: 'pending'
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

// Duyệt đề tài
router.put('/:id/approve', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    }

    topic.topic_teacher_status = 'approved';
    await topic.save();

    res.json({ message: 'Đã duyệt đề tài thành công', topic });
  } catch (err) {
    console.error('Error approving topic:', err);
    res.status(500).json({ error: err.message });
  }
});

// Từ chối đề tài
router.put('/:id/reject', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    }

    topic.topic_teacher_status = 'rejected';
    await topic.save();

    res.json({ message: 'Đã từ chối đề tài', topic });
  } catch (err) {
    console.error('Error rejecting topic:', err);
    res.status(500).json({ error: err.message });
  }
});

// Giảng viên duyệt đề tài
router.put('/:id/approve-by-lecturer', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    topic.topic_teacher_status = 'approved';
    topic.topic_admin_status = 'pending';
    await topic.save();
    res.json({ message: 'Đã duyệt đề tài, chờ admin duyệt', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi duyệt đề tài bởi giảng viên', error: err.message });
  }
});

// Admin duyệt đề tài
router.put('/:id/approve-by-admin', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    topic.topic_leader_status = 'approved';
    await topic.save();

    // Gửi thông báo cho sinh viên và giảng viên nếu có comment
    const { comment } = req.body;
    if (comment && comment.trim()) {
      const notifications = [
        {
          user_notification_title: 'Đề tài đã được duyệt',
          user_notification_sender: req.user?._id || null,
          user_notification_recipient: topic.topic_group_student[0],
          user_notification_content: `Đề tài "${topic.topic_title}" đã được admin duyệt.\nNhận xét: ${comment}`,
          user_notification_type: 2,
          user_notification_isRead: false,
          user_notification_topic: 'topic',
        },
        {
          user_notification_title: 'Đề tài đã được duyệt',
          user_notification_sender: req.user?._id || null,
          user_notification_recipient: topic.topic_instructor,
          user_notification_content: `Đề tài "${topic.topic_title}" đã được admin duyệt.\nNhận xét: ${comment}`,
          user_notification_type: 2,
          user_notification_isRead: false,
          user_notification_topic: 'topic',
        }
      ];
      await UserNotification.insertMany(notifications);
    }

    res.json({ message: 'Đề tài đã được admin duyệt', topic });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi duyệt đề tài bởi admin', error: err.message });
  }
});

// Lấy danh sách đề tài chờ admin duyệt
router.get('/admin/pending-topics', async (req, res) => {
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

// Admin từ chối đề tài
router.put('/:id/reject-by-admin', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    topic.topic_leader_status = 'rejected';
    await topic.save();

    // Gửi thông báo cho sinh viên và giảng viên
    const { comment } = req.body;
    const notifications = [
      {
        user_notification_title: 'Đề tài bị từ chối',
        user_notification_sender: req.user?._id || null, // id admin nếu có
        user_notification_recipient: topic.topic_group_student[0], // id sinh viên đề xuất
        user_notification_content: `Đề tài "${topic.topic_title}" đã bị từ chối bởi admin.${comment && comment.trim() ? `\nNhận xét: ${comment}` : ''}`,
        user_notification_type: 2,
        user_notification_isRead: false,
        user_notification_topic: 'topic',
      },
      {
        user_notification_title: 'Đề tài bị từ chối',
        user_notification_sender: req.user?._id || null,
        user_notification_recipient: topic.topic_instructor,
        user_notification_content: `Đề tài "${topic.topic_title}" đã bị từ chối bởi admin.${comment && comment.trim() ? `\nNhận xét: ${comment}` : ''}`,
        user_notification_type: 2,
        user_notification_isRead: false,
        user_notification_topic: 'topic',
      }
    ];
    await UserNotification.insertMany(notifications);

    res.json({ message: 'Đã từ chối đề tài và gửi thông báo.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi từ chối đề tài', error: err.message });
  }
});

// Lấy đề tài mà sinh viên đã đăng ký
router.get('/student/:user_id', async (req, res) => {
  try {
    // Đầu tiên tìm user theo user_id
    const user = await User.findOne({ user_id: req.params.user_id });
    if (!user) {
      return res.json(null);
    }

    // Sau đó tìm topic có chứa _id của user trong mảng topic_group_student
    const topic = await Topic.findOne({
      topic_group_student: user._id
    })
      .populate('topic_instructor', 'user_name')
      .populate('topic_major', 'major_title')
      .populate('topic_category', 'topic_category_title')
      .populate('topic_group_student', 'user_name user_id');

    if (!topic) {
      return res.json(null);
    }
    res.json(topic);
  } catch (err) {
    console.error('Error fetching student topic:', err);
    res.status(500).json({ error: err.message });
  }
});

// Sinh viên hủy đăng ký đề tài
router.post('/:id/cancel-registration', async (req, res) => {
  try {
    let { studentId } = req.body;
    let topic = await Topic.findById(req.params.id).populate('topic_creator');
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });

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
        user_notification_title: 'Nhóm sinh viên đã hủy đăng ký đề tài',
        user_notification_sender: studentId,
        user_notification_recipient: topic.topic_instructor,
        user_notification_content: `Nhóm sinh viên đã hủy đăng ký và đề tài "${topic.topic_title}" đã bị xóa!`,
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
      user_notification_title: 'Nhóm sinh viên đã hủy đăng ký đề tài',
      user_notification_sender: studentId,
      user_notification_recipient: topic.topic_instructor,
      user_notification_content: `Nhóm sinh viên đã hủy đăng ký đề tài "${topic.topic_title}"`,
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
  try {
    const instructorId = req.params.instructorId;
    let objectId = null;
    
    // Validate instructorId
    if (!instructorId) {
      return res.status(400).json({ error: 'Instructor ID is required' });
    }

    // Convert to ObjectId if valid
    if (mongoose.Types.ObjectId.isValid(instructorId)) {
      objectId = new mongoose.Types.ObjectId(instructorId);
    }

    console.log('Querying topics for instructor:', {
      instructorId,
      objectId,
      isValid: mongoose.Types.ObjectId.isValid(instructorId)
    });

    // Find all topics
    const allTopics = await Topic.find({})
      .populate('topic_instructor', 'user_name')
      .populate('topic_category', 'type_name topic_category_title')
      .lean();

    // Log topic details for debugging
    allTopics.forEach(topic => {
      console.log('Topic details:', {
        id: topic._id,
        title: topic.topic_title,
        instructor: topic.topic_instructor,
        instructorId: topic.topic_instructor?._id,
        instructorType: typeof topic.topic_instructor,
        isObjectId: topic.topic_instructor instanceof mongoose.Types.ObjectId
      });
    });

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

    console.log('Query results:', {
      totalTopics: allTopics.length,
      matchedTopics: matchedTopics.length,
      instructorId
    });

    res.json(matchedTopics);
  } catch (error) {
    console.error('Error in /instructor/:instructorId/all:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 