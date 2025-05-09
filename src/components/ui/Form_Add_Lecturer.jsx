import { useState, useEffect } from "react";
import axios from "axios";

const departmentsData = ["Công nghệ thông tin", "Quản trị kinh doanh"];

const LecturerForm = ({ onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    lecturer_id: "",
    full_name: "",
    email: "",
    phone: "",
    birthday: "",
    department: "",
  });

  const [errors, setErrors] = useState({});
  const [maxBirthday, setMaxBirthday] = useState("");

  useEffect(() => {
    // Tính toán ngày tối đa có thể chọn (cách đây 22 năm)
    const today = new Date();
    const twentyTwoYearsAgo = new Date(
      today.getFullYear() - 22,
      today.getMonth(),
      today.getDate()
    );
    const maxDateString = twentyTwoYearsAgo.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD
    setMaxBirthday(maxDateString);

    if (initialData) {
      console.log(
        "initialData.birthday nhận được trong LecturerForm:",
        initialData.birthday
      );
      setFormData({
        lecturer_id: initialData.lecturer_id || "",
        full_name: initialData.full_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        birthday: initialData.birthday || "",
        department: initialData.department || "",
      });
    } else {
      setFormData({
        lecturer_id: "",
        full_name: "",
        email: "",
        phone: "",
        birthday: "",
        department: "",
      });
      setErrors({});
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const nameRegex = /^[\p{L}\s]+$/u;

    let validationErrors = {};

    if (!nameRegex.test(formData.full_name)) {
      validationErrors.full_name =
        "Họ tên không hợp lệ (chỉ chữ cái và khoảng trắng)";
    }

    if (!emailRegex.test(formData.email)) {
      validationErrors.email = "Email không hợp lệ";
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      validationErrors.phone = "Số điện thoại phải gồm 10 chữ số";
    }

    if (!formData.department) {
      validationErrors.department = "Vui lòng chọn khoa";
    }

    if (!formData.birthday) {
      validationErrors.birthday = "Vui lòng chọn ngày sinh";
    } else {
      const birthDate = new Date(formData.birthday);

      if (isNaN(birthDate.getTime())) {
        validationErrors.birthday = "Ngày sinh không hợp lệ";
      } else {
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (
          age < 22 ||
          (age === 22 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
        ) {
          validationErrors.birthday = "Giảng viên phải từ 22 tuổi trở lên";
        }
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    // Hàm format ngày thành DD/MM/YYYY
    const formatDateToSend = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const dataToSend = {
      ...formData,
      birthday: formData.birthday ? formatDateToSend(formData.birthday) : "",
    };

    try {
      if (initialData && initialData._id) {
        await axios.put(
          `http://localhost:5000/api/lecturers/${initialData._id}`,
          dataToSend
        );
        onSuccess();
      } else {
        await axios.post("http://localhost:5000/api/lecturers", dataToSend);
        onSuccess();
      }
    } catch (error) {
      if (error.response?.status === 400) {
        if (
          error.response.data.message.includes("Mã số giảng viên đã tồn tại!")
        ) {
          setErrors({ lecturer_id: error.response.data.message });
        } else if (
          error.response.data.message.includes(
            "Địa chỉ email này đã được sử dụng!"
          )
        ) {
          setErrors({ email: error.response.data.message });
        } else {
          console.error("Lỗi khi thêm/sửa giảng viên:", error);
        }
      } else {
        console.error("Lỗi khi thêm/sửa giảng viên:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Mã giảng viên</label>
          <input
            type="text"
            name="lecturer_id"
            value={formData.lecturer_id}
            onChange={handleChange}
            required
            readOnly={!!initialData}
            className={`w-full border rounded px-3 py-2 ${
              errors.lecturer_id ? "border-red-500" : ""
            }`}
          />
          {errors.lecturer_id && (
            <p className="text-red-500 text-sm mt-1">{errors.lecturer_id}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Họ và tên</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className={`w-full border rounded px-3 py-2 ${
              errors.full_name ? "border-red-500" : ""
            }`}
          />
          {errors.full_name && (
            <p className="text-red-600 text-sm mt-1">{errors.full_name}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full border rounded px-3 py-2 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${
              errors.phone ? "border-red-500" : ""
            }`}
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Ngày sinh</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            max={maxBirthday}
            placeholder="yyyy-MM-dd"
          />
          {errors.birthday && (
            <p className="text-red-600 text-sm mt-1">{errors.birthday}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Khoa</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${
              errors.department ? "border-red-500" : ""
            }`}
          >
            <option value="">-- Chọn khoa --</option>
            {departmentsData.map((dep, idx) => (
              <option key={idx} value={dep}>
                {dep}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-red-600 text-sm mt-1">{errors.department}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {initialData ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
};

export default LecturerForm; 