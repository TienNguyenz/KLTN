const Scoreboard = require('../models/Scoreboard');

// Tạo mới bảng điểm (lưu điểm chấm)
exports.createScoreboard = async (req, res) => {
  try {
    console.log('Scoreboard data received:', req.body); // Log dữ liệu nhận được
    
    // Kiểm tra đã có điểm cho sinh viên này, rubric này, topic này chưa
    const existed = await Scoreboard.findOne({
      rubric_id: req.body.rubric_id,
      topic_id: req.body.topic_id,
      student_id: req.body.student_id,
      grader: req.body.grader
    });

    if (existed) {
      // Nếu đã tồn tại, cập nhật điểm
      existed.rubric_student_evaluations = req.body.rubric_student_evaluations;
      existed.total_score = req.body.total_score;
      existed.student_grades = req.body.student_grades;
      existed.evaluator_type = req.body.evaluator_type;
      await existed.save();
      return res.status(200).json({ message: 'Cập nhật điểm thành công!', data: existed });
    }

    // Nếu chưa tồn tại, tạo mới
    const scoreboardData = {
      ...req.body,
      evaluator_type: req.body.evaluator_type || 'gvhd' // Đảm bảo có giá trị mặc định
    };
    
    console.log('Creating new scoreboard with data:', scoreboardData); // Log dữ liệu trước khi tạo
    
    const scoreboard = new Scoreboard(scoreboardData);
    await scoreboard.save();
    res.status(201).json({ message: 'Lưu điểm thành công!', data: scoreboard });
  } catch (err) {
    console.error('Error in createScoreboard:', err);
    res.status(500).json({ message: 'Lỗi khi lưu điểm!', error: err.message });
  }
};

// Lấy bảng điểm theo query
exports.getScoreboards = async (req, res) => {
  console.log('GET /api/scoreboards', req.query);
  try {
    const filter = {};
    if (req.query.rubric_id) filter.rubric_id = req.query.rubric_id;
    if (req.query.topic_id) filter.topic_id = req.query.topic_id;
    if (req.query.student_id) filter.student_id = req.query.student_id;
    if (req.query.grader) filter.grader = req.query.grader;
    const scoreboards = await Scoreboard.find(filter).populate('grader', 'user_name user_id');
    res.status(200).json(scoreboards);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy bảng điểm!', error: err.message });
  }
}; 