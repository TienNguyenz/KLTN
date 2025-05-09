import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin, Alert, Divider, Table, Tag } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaMinus, FaUserPlus, FaSave, FaTrash, FaPaperPlane } from 'react-icons/fa';

const EditTopic = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTopic = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/topics/${id}`);
        setTopic(res.data);
      } catch (err) {
        setError('Không tìm thấy đề tài hoặc có lỗi khi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    loadTopic();
  }, [id]);

  const handleClose = () => {
    navigate('/lecturer/topics');
  };

  if (loading) {
    return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>;
  }
  if (error) {
    return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Lỗi</p>
          <p>{error}</p>
          <button
            onClick={handleClose}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>;
  }
  if (!topic) {
    return null;
  }

  // Table columns for students
  const studentColumns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 60,
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Họ tên',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Mã số',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết đề tài</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-500 uppercase mb-1">
              Tên đề tài
            </label>
            <p className="text-lg font-semibold text-gray-900">{topic.topic_title}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-500 uppercase mb-1">
              Chuyên ngành
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {topic.topic_major?.major_title || 'Chưa có'}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-500 uppercase mb-1">
              Loại đề tài
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {topic.topic_category?.topic_category_title || topic.topic_category?.type_name || 'Chưa có'}
            </p>
        </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-500 uppercase mb-1">
              Mô tả
            </label>
            <p className="text-gray-700 whitespace-pre-wrap">{topic.topic_description || 'Chưa có mô tả'}</p>
        </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-500 uppercase mb-2">
              Sinh viên thực hiện
            </label>
            {topic.topic_group_student && topic.topic_group_student.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên sinh viên
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã số
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topic.topic_group_student.map((student, index) => (
                      <tr key={student._id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.user_name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {student.user_id}
                          </span>
                        </td>
                      </tr>
                ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">Chưa có sinh viên thực hiện</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <Button key="xoa" danger size="large" className="px-6"><FaTrash className="mr-2" /> Xóa</Button>
          <Button key="guidangky" type="primary" size="large" className="bg-green-500 px-6"><FaPaperPlane className="mr-2" />Gửi đăng ký</Button>
          <Button key="capnhat" type="primary" size="large" className="bg-blue-500 px-6"><FaSave className="mr-2" />Cập nhật đề tài</Button>
        </div>
      </div>
    </div>
  );
};

export default EditTopic; 