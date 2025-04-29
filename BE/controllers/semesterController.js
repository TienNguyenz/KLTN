const Semester = require('../models/Semester');

// Get all semesters
exports.getAllSemesters = async (req, res) => {
    try {
        const semesters = await Semester.find().sort({ createdAt: -1 });
        res.status(200).json(semesters);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách học kỳ', error: error.message });
    }
};

// Create new semester
exports.createSemester = async (req, res) => {
    try {
        const { semester, school_year_start, school_year_end } = req.body;

        // Kiểm tra học kỳ đã tồn tại
        const existingSemester = await Semester.findOne({ semester });
        if (existingSemester) {
            return res.status(400).json({ message: 'Học kỳ này đã tồn tại!' });
        }

        const newSemester = new Semester({
            semester,
            school_year_start: new Date(school_year_start),
            school_year_end: new Date(school_year_end),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedSemester = await newSemester.save();
        res.status(201).json(savedSemester);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi tạo học kỳ mới', error: error.message });
    }
};

// Update semester
exports.updateSemester = async (req, res) => {
    try {
        const { semester, school_year_start, school_year_end } = req.body;
        
        // Kiểm tra học kỳ tồn tại
        const existingSemester = await Semester.findOne({ 
            semester, 
            _id: { $ne: req.params.id } 
        });
        
        if (existingSemester) {
            return res.status(400).json({ message: 'Tên học kỳ này đã tồn tại!' });
        }

        const updatedSemester = await Semester.findByIdAndUpdate(
            req.params.id,
            {
                semester,
                school_year_start: new Date(school_year_start),
                school_year_end: new Date(school_year_end),
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedSemester) {
            return res.status(404).json({ message: 'Không tìm thấy học kỳ!' });
        }

        res.status(200).json(updatedSemester);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi cập nhật học kỳ', error: error.message });
    }
};

// Delete semester
exports.deleteSemester = async (req, res) => {
    try {
        const deletedSemester = await Semester.findByIdAndDelete(req.params.id);
        
        if (!deletedSemester) {
            return res.status(404).json({ message: 'Không tìm thấy học kỳ!' });
        }

        res.status(200).json({ message: 'Xóa học kỳ thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa học kỳ', error: error.message });
    }
}; 