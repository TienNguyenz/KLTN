const User = require("../models/User");
const Major = require("../models/Major"); // Import model Major của bạn

const getProfileGV = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    if (user.role === "giangvien") {
      // Trả về trực tiếp thông tin từ model User cho giảng viên
      res.status(200).json(user);
    } else {
      res
        .status(403)
        .json({ message: "Không có quyền truy cập thông tin giảng viên." });
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin giảng viên:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

const updateProfileGV = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role === "giangvien") {
      // Cập nhật trực tiếp các trường của user dựa trên dữ liệu gửi lên
      const { lecturer_phone, lecturer_department, ...otherFields } = req.body;
      const updatedLecturer = await User.findByIdAndUpdate(
        userId,
        { lecturer_phone, lecturer_department, ...otherFields },
        { new: true }
      ).select("-password");

      if (!updatedLecturer) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy thông tin giảng viên." });
      }
      return res.status(200).json(updatedLecturer);
    } else {
      return res
        .status(403)
        .json({ message: "Không có quyền cập nhật thông tin giảng viên." });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin giảng viên:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    let profileData = { ...user.toObject() }; // Sao chép thông tin người dùng

    if (user.user_major) {
      const major = await Major.findById(user.user_major);
      if (major) {
        profileData.major_title = major.major_title;
        profileData.major_description = major.major_description;
        profileData.training_system = major.training_system;
        // Có thể thêm các trường khác từ bảng chuyên ngành nếu cần
      }
    }

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng và chuyên ngành:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { user_temporary_address, user_permanent_address, user_phone } =
      req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        user_temporary_address,
        user_permanent_address,
        user_phone,
      },
      { new: true } // Trả về document đã được cập nhật
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

module.exports = { getProfile, updateProfile, getProfileGV, updateProfileGV };
