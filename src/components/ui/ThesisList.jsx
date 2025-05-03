import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, message, Modal } from 'antd';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import axios from 'axios';

const { Search } = Input;
const { Option } = Select;

const ThesisList = () => {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);

  useEffect(() => {
    fetchFacultiesAndMajors();
    fetchTheses();
  }, [searchText, filterFaculty, filterMajor]);

  const fetchFacultiesAndMajors = async () => {
    try {
      const [facultiesRes, majorsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/database/collections/faculties"),
        axios.get("http://localhost:5000/api/database/collections/majors")
      ]);
      setFaculties(facultiesRes.data);
      setMajors(majorsRes.data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu khoa và chuyên ngành:", err);
      message.error("Không thể tải dữ liệu khoa và chuyên ngành");
    }
  };

  const fetchTheses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/database/collections/Topic", {
        params: {
          search: searchText,
          faculty: filterFaculty,
          major: filterMajor
        }
      });
      
      console.log("API Response:", response.data);

      const filteredTheses = response.data.filter(thesis => {
        if (thesis.topic_teacher_status !== 'approved' || thesis.topic_leader_status !== 'approved') {
          return false;
        }
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          if (!thesis.topic_title?.toLowerCase().includes(searchLower)) {
            return false;
          }
        }
        if (filterFaculty && thesis.topic_category !== filterFaculty) {
          return false;
        }
        if (filterMajor && thesis.topic_major !== filterMajor) {
          return false;
        }
        return true;
      });

      console.log("Filtered Theses:", filteredTheses);
      setTheses(filteredTheses);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu đề tài:", err);
      message.error("Không thể tải dữ liệu đề tài");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (thesis) => {
    setSelectedThesis(thesis);
    setIsViewModalVisible(true);
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên đề tài',
      dataIndex: 'topic_title',
      key: 'topic_title',
    },
    {
      title: 'GVHD',
      dataIndex: 'topic_instructor',
      key: 'topic_instructor',
      render: (instructorId) => {
        const instructor = faculties.find(f => f._id === instructorId);
        return instructor ? instructor.faculty_title : 'Chưa có GVHD';
      }
    },
    {
      title: 'Loại đề tài',
      dataIndex: 'topic_category',
      key: 'topic_category',
    },
    {
      title: 'Học kì',
      dataIndex: 'topic_registration_period',
      key: 'topic_registration_period',
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Số lượng SV',
      dataIndex: 'topic_max_members',
      key: 'topic_max_members',
      width: 100,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'topic_teacher_status',
      key: 'topic_teacher_status',
      render: (status) => {
        const statusMap = {
          approved: 'Đã duyệt',
          pending: 'Chờ duyệt',
          rejected: 'Từ chối',
          in_progress: 'Đang thực hiện',
          completed: 'Đã hoàn thành',
        };
        return statusMap[status?.toLowerCase()] || status;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<FaEye style={{ color: '#4096ff' }} />}
            onClick={() => handleView(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="text-2xl font-bold mb-4">Danh sách đề tài</div>
        <div className="flex gap-4">
          <Search
            placeholder="Tìm kiếm theo tên đề tài"
            allowClear
            onSearch={(value) => setSearchText(value)}
            style={{ width: 300 }}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Chọn khoa"
            allowClear
            onChange={(value) => {
              setFilterFaculty(value);
              setFilterMajor('');
            }}
          >
            {faculties.map(faculty => (
              <Option key={faculty._id} value={faculty._id}>
                {faculty.faculty_title}
              </Option>
            ))}
          </Select>
          <Select
            style={{ width: 200 }}
            placeholder="Chọn chuyên ngành"
            allowClear
            disabled={!filterFaculty}
            onChange={(value) => setFilterMajor(value)}
          >
            {majors
              .filter(major => major.major_faculty === filterFaculty)
              .map(major => (
                <Option key={major._id} value={major._id}>
                  {major.major_title}
                </Option>
              ))}
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={theses}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
      />

      <Modal
        title="Chi tiết đề tài"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedThesis && (
          <div className="space-y-4">
            <div>
              <div className="font-semibold">Tên đề tài:</div>
              <div>{selectedThesis.topic_title}</div>
            </div>
            <div>
              <div className="font-semibold">Mô tả:</div>
              <div>{selectedThesis.topic_description}</div>
            </div>
            <div>
              <div className="font-semibold">GVHD:</div>
              <div>{faculties.find(f => f._id === selectedThesis.topic_instructor)?.faculty_title || 'Chưa có GVHD'}</div>
            </div>
            <div>
              <div className="font-semibold">Loại đề tài:</div>
              <div>{selectedThesis.topic_category}</div>
            </div>
            <div>
              <div className="font-semibold">Số lượng sinh viên tối đa:</div>
              <div>{selectedThesis.topic_max_members}</div>
            </div>
            <div>
              <div className="font-semibold">Trạng thái:</div>
              <div>{selectedThesis.topic_teacher_status}</div>
            </div>
            {selectedThesis.topic_group_student && selectedThesis.topic_group_student.length > 0 && (
              <div>
                <div className="font-semibold">Nhóm sinh viên thực hiện:</div>
                <ul>
                  {selectedThesis.topic_group_student.map((group, index) => (
                    <li key={index}>Nhóm {index + 1}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ThesisList; 