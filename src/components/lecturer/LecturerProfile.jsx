import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faEnvelope,
  faPhoneAlt,
  faBuilding,
  faEdit,
  faSave,
  faCalendarAlt,
  faMapMarkerAlt,
  faIdCard,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { Modal, Input, message } from 'antd';

const LecturerProfile = () => {
  console.log("LecturerProfile component được render");
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfileData, setTempProfileData] = useState({});
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resultType, setResultType] = useState('success'); // 'success' hoặc 'error'
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveType, setSaveType] = useState('success');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = user?.token;
        if (!token) {
          console.log(
            "Không có token, không thể tải thông tin cá nhân giảng viên."
          );
          setError("Bạn chưa đăng nhập hoặc không có quyền truy cập.");
          setLoading(false);
          return;
        }
        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProfileData(data);
        setTempProfileData(data);
      } catch (error) {
        setError("Không thể tải thông tin cá nhân giảng viên.");
        console.error("Lỗi khi tải thông tin giảng viên:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchProfile();
    } else if (!loading) {
      setError("Bạn chưa đăng nhập hoặc không có quyền truy cập.");
      setLoading(false);
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    console.log('tempProfileData sau khi nhập:', tempProfileData);
  };

  const handleSaveClick = async () => {
    // Validate số điện thoại
    const phone = tempProfileData.user_phone || '';
    if (!/^\d{10}$/.test(phone)) {
      setSaveMessage('Số điện thoại phải có đúng 10 chữ số!');
      setSaveType('error');
      setIsSaveModalVisible(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = user?.token;
      if (!token) {
        setError("Bạn chưa đăng nhập hoặc không có quyền truy cập.");
        setLoading(false);
        setIsEditing(false);
        setSaveMessage("Bạn chưa đăng nhập hoặc không có quyền truy cập.");
        setSaveType('error');
        setIsSaveModalVisible(true);
        return;
      }

      const dataToSend = {
        user_phone: tempProfileData.user_phone,
        user_permanent_address: tempProfileData.user_permanent_address,
      };
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSaveMessage(errorData.message || "Cập nhật thông tin giảng viên thất bại.");
        setSaveType('error');
        setIsSaveModalVisible(true);
        throw new Error(errorData.message || "Cập nhật thông tin giảng viên thất bại.");
      }

      const updatedData = await response.json();
      setProfileData(updatedData);
      setIsEditing(false);
      setSaveMessage("Lưu thông tin thành công!");
      setSaveType('success');
      setIsSaveModalVisible(true);
    } catch (error) {
      setError(error.message);
      setSaveMessage(error.message || "Lưu thông tin thất bại!");
      setSaveType('error');
      setIsSaveModalVisible(true);
      console.error("Lỗi khi cập nhật thông tin giảng viên:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate password mới
    if (passwordData.newPassword.length < 6) {
      setResultMessage('Mật khẩu mới phải có ít nhất 6 ký tự!');
      setResultType('error');
      setIsResultModalVisible(true);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setResultMessage('Mật khẩu mới không khớp!');
      setResultType('error');
      setIsResultModalVisible(true);
      return;
    }

    try {
      const requestBody = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };
      const response = await fetch(`http://localhost:5000/api/database/collections/User/${profileData._id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (!response.ok) {
        setResultMessage(data.message || 'Đổi mật khẩu thất bại!');
        setResultType('error');
        setIsResultModalVisible(true);
        throw new Error(data.message || 'Đổi mật khẩu thất bại!');
      }
      setResultMessage('Đổi mật khẩu thành công!');
      setResultType('success');
      setIsResultModalVisible(true);
      setTimeout(() => setIsPasswordModalVisible(false), 700);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setResultMessage(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      setResultType('error');
      setIsResultModalVisible(true);
      console.error('=== CHI TIẾT LỖI ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
      message.error('File phải là hình ảnh');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    // Lưu avatar cũ trước khi upload mới
    const oldAvatar = profileData.user_avatar;

    try {
      const response = await fetch('http://localhost:5000/api/database/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload avatar thất bại');
      }

      const data = await response.json();
      if (data.url) {
        // Gọi API cập nhật user_avatar vào database
        const updateRes = await fetch(`http://localhost:5000/api/database/collections/User/${profileData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ user_avatar: data.url })
        });
        if (!updateRes.ok) {
          throw new Error('Cập nhật avatar vào hồ sơ thất bại');
        }
        // Cập nhật lại profileData để avatar mới hiển thị ngay
        setProfileData(prev => ({ ...prev, user_avatar: data.url }));
        message.success('Upload avatar thành công!');
        // Xóa file avatar cũ nếu có và khác file mới
        if (oldAvatar && oldAvatar !== data.url) {
          const filename = oldAvatar.split('/').pop();
          await fetch(`http://localhost:5000/api/database/uploads/${filename}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
        }
      }
    } catch (error) {
      message.error('Upload avatar thất bại: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-md flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-md text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold text-gray-800">
          <FontAwesomeIcon icon={faUserCircle} className="mr-3 text-blue-500" /> Hồ Sơ Giảng Viên
        </h2>
        <div className="space-x-4">
          <button
            onClick={() => setIsPasswordModalVisible(true)}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:shadow-outline"
          >
            <FontAwesomeIcon icon={faKey} className="mr-2" /> Đổi Mật Khẩu
          </button>
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:shadow-outline"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" /> Chỉnh Sửa
            </button>
          ) : (
            <button
              onClick={handleSaveClick}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:shadow-outline"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" /> Lưu
            </button>
          )}
        </div>
      </div>

      {profileData && (
        <div className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {profileData.user_avatar ? (
                  <img 
                    src={`http://localhost:5000${profileData.user_avatar}`}
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserCircle} className="text-6xl text-blue-500" />
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <FontAwesomeIcon icon={faEdit} />
                </label>
              )}
            </div>
            <h3 className="mt-4 text-2xl font-bold text-gray-800">{profileData.user_name || profileData.fullName || profileData.name || 'N/A'}</h3>
            <p className="text-gray-600">{profileData.user_id || profileData.lecturerId || 'N/A'}</p>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <strong className="text-gray-700 block mb-2 flex items-center">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-blue-500" /> Email:
              </strong>
              <p className="text-blue-600 hover:underline">{profileData.email || "N/A"}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <strong className="text-gray-700 block mb-2 flex items-center">
                <FontAwesomeIcon icon={faPhoneAlt} className="mr-2 text-green-500" /> Số điện thoại:
              </strong>
              {isEditing ? (
                <input
                  type="text"
                  name="user_phone"
                  value={tempProfileData?.user_phone || ""}
                  onChange={handleInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profileData?.user_phone || "N/A"}</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <strong className="text-gray-700 block mb-2 flex items-center">
                <FontAwesomeIcon icon={faBuilding} className="mr-2 text-purple-500" /> Khoa:
              </strong>
              <p className="text-gray-900 font-medium">{profileData?.user_department || "N/A"}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <strong className="text-gray-700 block mb-2 flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-pink-500" /> Ngày sinh:
              </strong>
              <p className="text-gray-900 font-medium">{profileData?.user_date_of_birth || "N/A"}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <strong className="text-gray-700 block mb-2 flex items-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-red-500" /> Địa chỉ:
              </strong>
              {isEditing ? (
                <input
                  type="text"
                  name="user_permanent_address"
                  value={tempProfileData?.user_permanent_address || ""}
                  onChange={handleInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profileData?.user_permanent_address || "N/A"}</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <strong className="text-gray-700 block mb-2 flex items-center">
                <FontAwesomeIcon icon={faIdCard} className="mr-2 text-indigo-500" /> CCCD:
              </strong>
              <p className="text-gray-900 font-medium">{profileData?.user_CCCD || "N/A"}</p>
            </div>
          </div>
        </div>
      )}
      {!profileData && !loading && !error && (
        <p className="text-gray-700">Không có thông tin cá nhân giảng viên.</p>
      )}

      {/* Password Change Modal */}
      <Modal
        title="Đổi Mật Khẩu"
        open={isPasswordModalVisible}
        onOk={handlePasswordChange}
        onCancel={() => setIsPasswordModalVisible(false)}
        okText="Đổi Mật Khẩu"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
            <Input.Password
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <Input.Password
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
            <Input.Password
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
        </div>
      </Modal>

      {/* Modal thông báo kết quả đổi mật khẩu */}
      <Modal
        open={isResultModalVisible}
        onOk={() => setIsResultModalVisible(false)}
        onCancel={() => setIsResultModalVisible(false)}
        okText="Đóng"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div className="text-center py-4">
          {resultType === 'success' ? (
            <span style={{ fontSize: 48, color: '#52c41a' }}>✔️</span>
          ) : (
            <span style={{ fontSize: 48, color: '#ff4d4f' }}>❌</span>
          )}
          <p className="mt-4 text-lg">{resultMessage}</p>
        </div>
      </Modal>

      {/* Modal thông báo lưu thông tin */}
      <Modal
        open={isSaveModalVisible}
        onOk={() => setIsSaveModalVisible(false)}
        onCancel={() => setIsSaveModalVisible(false)}
        okText="Đóng"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div className="text-center py-4">
          {saveType === 'success' ? (
            <span style={{ fontSize: 48, color: '#52c41a' }}>✔️</span>
          ) : (
            <span style={{ fontSize: 48, color: '#ff4d4f' }}>❌</span>
          )}
          <p className="mt-4 text-lg">{saveMessage}</p>
        </div>
      </Modal>
    </div>
  );
};

export default LecturerProfile;