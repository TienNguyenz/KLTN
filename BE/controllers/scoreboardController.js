const Scoreboard = require('../models/Scoreboard');

// Tạo mới bảng điểm (lưu điểm chấm)
exports.createScoreboard = async (req, res) => {
  try {
    const evaluator_type = req.body.evaluator_type;
    console.log('Scoreboard data:', req.body); // Log dữ liệu nhận được từ FE
    // Kiểm tra đã có điểm cho sinh viên này, rubric này, topic này chưa
    const existed = await Scoreboard.findOne({
      rubric_id: req.body.rubric_id,
      topic_id: req.body.topic_id,
      student_id: req.body.student_id,
      grader: req.body.grader
    });
    if (existed) {
      return res.status(400).json({ message: 'Đã chấm điểm cho sinh viên này với rubric này!' });
    }
    const scoreboard = new Scoreboard({
      ...req.body,
      evaluator_type
    });
    await scoreboard.save();
    res.status(201).json({ message: 'Lưu điểm thành công!', data: scoreboard });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lưu điểm!', error: err.message });
  }
};

// Lấy bảng điểm theo query
exports.getScoreboards = async (req, res) => {
  console.log('GET /api/scoreboards', req.query); // Thêm log debug
  try {
    const filter = {};
    if (req.query.rubric_id) filter.rubric_id = req.query.rubric_id;
    if (req.query.topic_id) filter.topic_id = req.query.topic_id;
    if (req.query.student_id) filter.student_id = req.query.student_id;
    if (req.query.grader) filter.grader = req.query.grader;
    const scoreboards = await Scoreboard.find(filter);
    res.status(200).json(scoreboards);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy bảng điểm!', error: err.message });
  }
}; 