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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">
          <FontAwesomeIcon icon={faUserCircle} className="mr-3 text-blue-500" /> Hồ Sơ Giảng Viên
        </h2>
        {!isEditing ? (
          <button
            onClick={handleEditClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" /> Chỉnh Sửa
          </button>
        ) : (
          <button
            onClick={handleSaveClick}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" /> Lưu
          </button>
        )}
      </div>
      {profileData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <strong className="text-gray-700 block mb-2">
              <FontAwesomeIcon icon={faUserCircle} className="mr-2 text-gray-500" /> Tên:
            </strong>
            <p className="text-gray-900 font-semibold">{profileData.user_name || user.name || "N/A"}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <strong className="text-gray-700 block mb-2">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-500" /> Email:
            </strong>
            <p className="text-blue-600 hover:underline">{profileData.email || "N/A"}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <strong className="text-gray-700 block mb-2">
              <FontAwesomeIcon icon={faPhoneAlt} className="mr-2 text-gray-500" /> Số điện thoại:
            </strong>
            {isEditing ? (
              <input
                type="text"
                name="user_phone"
                value={tempProfileData?.user_phone || ""}
                onChange={handleInputChange}
                className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData?.user_phone || "N/A"}</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <strong className="text-gray-700 block mb-2">
              <FontAwesomeIcon icon={faBuilding} className="mr-2 text-gray-500" /> Khoa:
            </strong>
            <p className="text-gray-900 font-medium">{profileData?.user_department || "N/A"}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <strong className="text-gray-700 block mb-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-500" /> Ngày sinh:
            </strong>
            <p className="text-gray-900 font-medium">{profileData?.user_date_of_birth || "N/A"}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <strong className="text-gray-700 block mb-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-500" /> Địa chỉ:
            </strong>
            {isEditing ? (
              <input
                type="text"
                name="user_permanent_address"
                value={tempProfileData?.user_permanent_address || ""}
                onChange={handleInputChange}
                className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profileData?.user_permanent_address || "N/A"}</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <strong className="text-gray-700 block mb-2">
              <FontAwesomeIcon icon={faIdCard} className="mr-2 text-gray-500" /> CCCD:
            </strong>
            <p className="text-gray-900 font-medium">{profileData?.user_CCCD || "N/A"}</p>
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