/* eslint-disable */
const Topic = require('../models/Topic');
const mongoose = require('mongoose');
const Council = require('../models/Council');
const Scoreboard = require('../models/Scoreboard');
const UserNotification = require('../models/UserNotification');

// Get all review topics
exports.getReviewTopics = async (req, res) => {
  try {
    const { reviewerId } = req.query;
    let query = { 
      topic_reviewer: { $exists: true, $ne: null }
    };

    if (reviewerId && mongoose.Types.ObjectId.isValid(reviewerId)) {
      query.topic_reviewer = new mongoose.Types.ObjectId(reviewerId);
    } else if (reviewerId) {
    }

    const topics = await Topic.find(query).populate([
      { path: 'topic_instructor', select: 'user_name' },
      { path: 'topic_reviewer', select: 'user_name' },
      { path: 'topic_creator', select: 'user_name user_id' },
      { path: 'topic_major', select: 'major_title' },
      { path: 'topic_category', select: 'topic_category_title' },
      { path: 'topic_group_student', select: 'user_name user_id' }
    ]);

    const formattedTopics = topics.map(topic => ({
      id: topic._id,
      title: topic.topic_title,
      supervisor: topic.topic_instructor?.user_name || '',
      reviewer: topic.topic_reviewer?.user_name || '',
      type: topic.topic_category?.topic_category_title || '',
      studentId: topic.topic_group_student?.[0]?.user_id || topic.topic_creator?.user_id || '',
      lecturer: topic.topic_instructor?.user_name || '',
      status: topic.topic_teacher_status === 'approved' ? 'ACTIVE' : (topic.topic_teacher_status === 'rejected' ? 'REJECTED' : 'REGISTERED'),
      groups: topic.topic_group_student,
    }));

    res.json({
      success: true,
      data: formattedTopics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching review topics',
      error: error.message
    });
  }
};

// Get all committee topics
exports.getCommitteeTopics = async (req, res) => {
  try {
    const { committeeId } = req.query;

    // Tìm các hội đồng mà người dùng là thành viên
    const assemblies = await Council.find({
      $or: [
        { chairman: committeeId },
        { secretary: committeeId },
        { members: committeeId }
      ]
    });

    // Lấy danh sách ID của các hội đồng
    const assemblyIds = assemblies.map(assembly => assembly._id);

    // Tìm các đề tài thuộc các hội đồng này
    const topics = await Topic.find({
      topic_assembly: { $in: assemblyIds.map(id => new mongoose.Types.ObjectId(id)) }
    })
    .populate('topic_category', 'topic_category_title')
    .populate('topic_major', 'major_title')
    .populate('topic_creator', 'user_name user_id')
    .populate('topic_instructor', 'user_name user_id')
    .populate('topic_reviewer', 'user_name user_id')
    .populate('topic_group_student', 'user_name user_id')
    .populate('topic_assembly', 'assembly_name')
    .sort({ createdAt: -1 });

    // Format dữ liệu trả về
    const formattedTopics = topics.map(topic => ({
      id: topic._id,
      title: topic.topic_title,
      description: topic.topic_description,
      category: topic.topic_category?.topic_category_title || 'N/A',
      major: topic.topic_major?.major_title || 'N/A',
      creator: topic.topic_creator?.user_name || 'N/A',
      maxMembers: topic.topic_max_members,
      students: topic.topic_group_student?.map(student => ({
        id: student._id,
        name: student.user_name,
        studentId: student.user_id
      })) || [],
      supervisor: topic.topic_instructor?.user_name || '[Chưa có GVHD]',
      reviewer: topic.topic_reviewer?.user_name || '[Chưa có GVHD]',
      teacherStatus: topic.topic_teacher_status,
      leaderStatus: topic.topic_leader_status,
      isBlocked: topic.topic_block,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      finalReport: topic.topic_final_report,
      finalReportName: topic.topic_final_report_original_name,
      assembly: topic.topic_assembly?.assembly_name || 'N/A',
      assemblyId: topic.topic_assembly?._id || '',
      status: topic.status || '',
      type: topic.topic_category?.topic_category_title || '[Chưa có loại đề tài]',
    }));

    res.json(formattedTopics);
  } catch (error) {
    console.error('Error in getCommitteeTopics:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get review topic by ID
exports.getReviewTopicById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID đề tài không hợp lệ' });
    }

    const topic = await Topic.findOne({ 
      _id: req.params.id,
      topic_reviewer: { $exists: true, $ne: null }
    }).populate([
      { path: 'topic_instructor', select: 'user_name user_id' },
      { path: 'topic_reviewer', select: 'user_name user_id' },
      { path: 'topic_creator', select: 'user_name user_id' },
      { path: 'topic_major', select: 'major_title' },
      { path: 'topic_category', select: 'topic_category_title' },
      { path: 'topic_group_student', select: 'user_name user_id' }
    ]);
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Review topic not found'
      });
    }

    const formattedTopic = {
      id: topic._id,
      name: topic.topic_title,
      title: topic.topic_title,
      supervisor: topic.topic_instructor?.user_name || '',
      reviewer: topic.topic_reviewer?.user_name || '',
      type: topic.topic_category?.topic_category_title || '',
      studentId: topic.topic_group_student?.[0]?.user_id || topic.topic_creator?.user_id || '',
      lecturer: topic.topic_instructor?.user_name || '',
      status: topic.topic_teacher_status === 'approved' ? 'ACTIVE' : (topic.topic_teacher_status === 'rejected' ? 'REJECTED' : 'REGISTERED'),
      maxStudents: topic.topic_max_members || 1,
      major: topic.topic_major?.major_title || '',
      description: topic.topic_description || '',
      groups: (topic.topic_group_student || []).map(student => ({
        id: student._id,
        studentName: student.user_name || '',
        studentId: student.user_id || '',
      })),
      topic_advisor_request: topic.topic_advisor_request || '',
      topic_final_report: topic.topic_final_report || '',
      topic_defense_request: topic.topic_defense_request || '',
      rubric_instructor: topic.rubric_instructor || '',
      rubric_reviewer: topic.rubric_reviewer || '',
      topic_room: topic.topic_room || '',
      topic_time_start: topic.topic_time_start || '',
      topic_time_end: topic.topic_time_end || '',
      topic_date: topic.topic_date || '',
      topic_block: topic.topic_block || false,
    };

    res.json({
      success: true,
      data: formattedTopic
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Định dạng ID đề tài không hợp lệ', error: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching review topic detail',
      error: error.message
    });
  }
};

// Get committee topic by ID
exports.getCommitteeTopicById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID đề tài không hợp lệ' });
    }
    const topic = await Topic.findOne({ 
      _id: req.params.id,
      topic_assembly: { $exists: true, $ne: null }
    }).populate([
      { path: 'topic_instructor', select: 'user_name user_id' },
      { path: 'topic_reviewer', select: 'user_name user_id' },
      { path: 'topic_creator', select: 'user_name user_id' },
      { path: 'topic_major', select: 'major_title' },
      { path: 'topic_category', select: 'topic_category_title' },
      { path: 'topic_group_student', select: 'user_name user_id email user_avatar user_date_of_birth user_CCCD user_phone user_permanent_address user_temporary_address user_faculty user_major user_status user_average_grade user_transcript' },
      { path: 'topic_assembly', select: 'assembly_name' }
    ]);
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Committee topic not found'
      });
    }

    // DEBUG LOG
    console.log('DEBUG topic.topic_category:', topic.topic_category);
    console.log('DEBUG topic.type:', topic.type);
    console.log('DEBUG topic_category _id:', topic.topic_category?._id);

    const formattedTopic = {
      id: topic._id,
      name: topic.topic_title,
      title: topic.topic_title,
      supervisor: topic.topic_instructor?.user_name || '[Chưa có GVHD]',
      reviewer: topic.topic_reviewer?.user_name || '[Chưa có GVHD]',
      type: topic.topic_category?.topic_category_title || '[Chưa có loại đề tài]',
      studentId: topic.topic_group_student?.[0]?.user_id || topic.topic_creator?.user_id || '',
      lecturer: topic.topic_instructor?.user_name || '',
      status: topic.topic_teacher_status === 'approved' ? 'ACTIVE' : (topic.topic_teacher_status === 'rejected' ? 'REJECTED' : 'REGISTERED'),
      maxStudents: topic.topic_max_members || 1,
      major: topic.topic_major?.major_title || '',
      description: topic.topic_description || '',
      groups: (topic.topic_group_student || []).map(student => ({
        id: student._id,
        studentName: student.user_name || '',
        studentId: student.user_id || '',
        email: student.email || '',
        user_avatar: student.user_avatar || '',
        user_date_of_birth: student.user_date_of_birth || '',
        user_CCCD: student.user_CCCD || '',
        user_phone: student.user_phone || '',
        user_permanent_address: student.user_permanent_address || '',
        user_temporary_address: student.user_temporary_address || '',
        user_faculty: student.user_faculty || '',
        user_major: student.user_major || '',
        user_status: student.user_status || '',
        user_average_grade: student.user_average_grade || '',
        user_transcript: student.user_transcript || '',
      })),
      topic_assembly: topic.topic_assembly?.assembly_name || '',
      topic_room: topic.topic_room || '',
      topic_time_start: topic.topic_time_start || '',
      topic_time_end: topic.topic_time_end || '',
      topic_date: topic.topic_date || '',
      topic_advisor_request: topic.topic_advisor_request || '',
      topic_final_report: topic.topic_final_report || '',
      topic_final_report_file: topic.topic_final_report_file || '',
      topic_defense_request: topic.topic_defense_request || '',
      rubric_instructor: topic.rubric_instructor || '',
      rubric_reviewer: topic.rubric_reviewer || '',
      topic_block: topic.topic_block || false,
    };

    res.json({
      success: true,
      data: formattedTopic
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Định dạng ID đề tài không hợp lệ', error: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching committee topic detail',
      error: error.message
    });
  }
};

// Đóng đề tài (Admin)
exports.closeTopic = async (req, res) => {
  try {
    const topicId = req.params.id;
    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy đề tài' });
    if (topic.status === 'completed') return res.status(400).json({ message: 'Đề tài đã đóng trước đó' });
    const students = topic.topic_group_student || [];
    if (!students.length) return res.status(400).json({ message: 'Đề tài chưa có sinh viên' });
    // Kiểm tra đủ điểm cho từng sinh viên (cá nhân + hội đồng)
    for (const studentId of students) {
      const personal = await Scoreboard.findOne({ topic_id: topicId, student_id: studentId, evaluator_type: 'gvhd' });
      const council = await Scoreboard.findOne({ topic_id: topicId, student_id: studentId, evaluator_type: 'hoidong' });
      if (!personal || !council) {
        return res.status(400).json({ message: 'Chưa chấm điểm xong cho tất cả sinh viên' });
      }
    }
    // Đủ điểm, cập nhật trạng thái
    topic.status = 'completed';
    await topic.save();
    // Gửi thông báo cho từng sinh viên
    for (const studentId of students) {
      await UserNotification.create({
        user_notification_title: 'Đề tài đã hoàn thành',
        user_notification_sender: req.user?._id || null,
        user_notification_recipient: studentId,
        user_notification_content: `Đề tài "${topic.topic_title}" đã được đóng. Bạn không thể chỉnh sửa hoặc nộp báo cáo nữa.`,
        user_notification_type: 1,
        user_notification_topic: topicId.toString(),
      });
    }
    res.json({ message: 'Đã đóng đề tài thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi đóng đề tài', error: err.message });
  }
}; 