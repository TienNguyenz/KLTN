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
} from "@fortawesome/free-solid-svg-icons";

const LecturerProfile = () => {
  console.log("LecturerProfile component được render");
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfileData, setTempProfileData] = useState({});

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
    setLoading(true);
    setError("");
    try {
      const token = user?.token;
      if (!token) {
        setError("Bạn chưa đăng nhập hoặc không có quyền truy cập.");
        setLoading(false);
        setIsEditing(false);
        return;
      }

      const dataToSend = {
        user_phone: tempProfileData.user_phone,
        user_permanent_address: tempProfileData.user_permanent_address,
      };
      console.log('Dữ liệu gửi đi (handleSaveClick):', JSON.stringify(dataToSend));

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
        throw new Error(
          errorData.message || "Cập nhật thông tin giảng viên thất bại."
        );
      }

      const updatedData = await response.json();
      setProfileData(updatedData);
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
      console.error("Lỗi khi cập nhật thông tin giảng viên:", error);
    } finally {
      setLoading(false);
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
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('avatar', file);
                        try {
                          const response = await fetch('http://localhost:5000/api/database/upload', {
                            method: 'POST',
                            body: formData
                          });
                          const data = await response.json();
                          if (data.url) {
                            setTempProfileData(prev => ({
                              ...prev,
                              user_avatar: data.url
                            }));
                          }
                        } catch (error) {
                          console.error('Error uploading avatar:', error);
                        }
                      }
                    }}
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
    </div>
  );
};

export default LecturerProfile;