import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, message, Modal } from 'antd';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

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
  const [notifyModal, setNotifyModal] = useState({ open: false, message: '', type: 'success' });
  const [personalScoreModal, setPersonalScoreModal] = useState({ open: false, loading: false, data: null, student: null });
  const [closeTopicLoading, setCloseTopicLoading] = useState(false);
  const [closeTopicError, setCloseTopicError] = useState('');
  const [allStudentsHaveScores, setAllStudentsHaveScores] = useState(false);

  useEffect(() => {
    fetchFacultiesAndMajors();
    fetchTheses();
  }, [searchText, filterFaculty, filterMajor]);

  const fetchFacultiesAndMajors = async () => {
    try {
      const [facultiesRes, majorsRes] = await Promise.all([
        axios.get("/api/faculties"),
        axios.get("/api/majors")
      ]);
      setFaculties(facultiesRes.data.data);
      setMajors(majorsRes.data.data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu khoa và chuyên ngành:", err);
      message.error("Không thể tải dữ liệu khoa và chuyên ngành");
    }
  };

  const fetchTheses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/topics", {
        params: {
          search: searchText,
          faculty: filterFaculty,
          major: filterMajor
        }
      });
      
      console.log("API Response:", response.data);

      const filteredTheses = response.data.data.filter(thesis => {
        if (thesis.topic_teacher_status !== 'approved' || thesis.topic_leader_status !== 'approved') {
          return false;
        }
        if (!Array.isArray(thesis.topic_group_student) || thesis.topic_group_student.length === 0) {
          return false;
        }
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          if (!thesis.topic_title?.toLowerCase().includes(searchLower)) {
            return false;
          }
        }
        if (filterFaculty) {
          const majorObj = majors.find(m => m._id === thesis.topic_major || m._id === thesis.topic_major?._id);
          if (!majorObj || majorObj.major_faculty !== filterFaculty) {
            return false;
          }
        }
        if (filterMajor && (thesis.topic_major !== filterMajor && thesis.topic_major?._id !== filterMajor)) {
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

  const handleExportExcel = () => {
    const dataExport = theses.map((thesis, idx) => ({
      'STT': idx + 1,
      'Tên đề tài': thesis.topic_title,
      'Giảng viên hướng dẫn': thesis.topic_instructor?.user_name || '',
      'Loại đề tài': thesis.topic_category?.topic_category_title || thesis.topic_category?.type_name || '',
      'Chuyên ngành': thesis.topic_major?.major_title || '',
      'Đợt đăng ký': thesis.topic_registration_period?.registration_period_name || thesis.topic_registration_period?.name || '',
      'Thời gian tạo': thesis.createdAt ? new Date(thesis.createdAt).toLocaleDateString('vi-VN') : '',
      'Số lượng SV': thesis.topic_max_members,
      'Trạng thái': (() => {
        const statusMap = {
          approved: 'Đã duyệt',
          pending: 'Chờ duyệt',
          rejected: 'Từ chối',
          in_progress: 'Đang thực hiện',
          completed: 'Đã hoàn thành',
        };
        return statusMap[thesis.topic_teacher_status?.toLowerCase()] || thesis.topic_teacher_status;
      })()
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);

    // Tự động set độ rộng cột theo nội dung
    const colWidths = Object.keys(dataExport[0] || {}).map(key => ({
      wch: Math.max(
        key.length + 2,
        ...dataExport.map(row => (row[key] ? row[key].toString().length : 0))
      ) + 2
    }));
    ws['!cols'] = colWidths;

    // Căn giữa và in đậm header
    Object.keys(dataExport[0] || {}).forEach((key, idx) => {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: idx })];
      if (cell) {
        cell.s = {
          font: { bold: true, sz: 13 },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          }
        };
      }
    });

    // Căn giữa dữ liệu
    for (let r = 1; r <= dataExport.length; r++) {
      for (let c = 0; c < colWidths.length; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        if (cell) {
          cell.s = {
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' }
            }
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đề tài');
    XLSX.writeFile(wb, 'Danh_sach_de_tai.xlsx');
  };

  const handleViewScore = async (student) => {
    setPersonalScoreModal({ open: true, loading: true, data: null, student });
    try {
      let url = `/api/scoreboards?student_id=${student._id}`;
      if (selectedThesis && selectedThesis._id) {
        url += `&topic_id=${selectedThesis._id}`;
      }
      const res = await axios.get(url);
      let data = res.data;
      if (Array.isArray(data)) {
        let scores = [];
        let gvhdArr = [], hoidongArr = [];
        data.forEach(sb => {
          let name = '';
          if (sb.grader && typeof sb.grader === 'object') {
            name = sb.grader.user_name || sb.grader.user_id || sb.grader._id;
          } else if (sb.grader_name) {
            name = sb.grader_name;
          } else {
            name = sb.grader;
          }
          let roleLabel = 'Khác', roleIcon = '👤';
          if (sb.evaluator_type === 'gvhd') { roleLabel = 'GVHD'; roleIcon = '🧑‍🏫'; gvhdArr.push(sb.total_score); }
          if (sb.evaluator_type === 'hoidong') { roleLabel = 'Hội đồng'; roleIcon = '👥'; hoidongArr.push(sb.total_score); }
          scores.push({
            roleIcon,
            roleLabel,
            evaluatorName: name,
            totalScore: sb.total_score
          });
        });
        const gvhd = gvhdArr.length ? gvhdArr.reduce((a,b)=>a+b,0)/gvhdArr.length : 0;
        while (hoidongArr.length < 3) hoidongArr.push(0);
        const councilAvg = (hoidongArr[0] + hoidongArr[1] + hoidongArr[2]) / 3;
        const weightedTotalScore = (gvhd * 0.4 + councilAvg * 0.6).toFixed(2);
        data = { scores, weightedTotalScore };
      }
      setPersonalScoreModal({ open: true, loading: false, data, student });
    } catch {
      setPersonalScoreModal({ open: true, loading: false, data: null, student });
      message.error('Không thể lấy điểm cá nhân');
    }
  };

  useEffect(() => {
    if (!isViewModalVisible || !selectedThesis || !selectedThesis.topic_group_student) return;
    const fetchAllScores = async () => {
      const scoresByStudent = {};
      let allOk = true;
      for (const sv of selectedThesis.topic_group_student) {
        try {
          const res = await axios.get(`/api/scoreboards?student_id=${sv._id}&topic_id=${selectedThesis._id}`);
          const arr = Array.isArray(res.data) ? res.data : [];
          scoresByStudent[sv._id] = arr;
          const gvhdCount = arr.filter(sb => sb.evaluator_type === 'gvhd').length;
          const hoidongCount = arr.filter(sb => sb.evaluator_type === 'hoidong').length;
          if (!(gvhdCount >= 1 && hoidongCount >= 3)) allOk = false;
        } catch {
          allOk = false;
        }
      }
      setAllStudentsHaveScores(allOk);
    };
    fetchAllScores();
  }, [isViewModalVisible, selectedThesis]);

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
      render: (instructor) => (instructor && instructor.user_name) ? instructor.user_name : (typeof instructor === 'string' ? instructor : 'Chưa có GVHD'),
    },
    {
      title: 'Chuyên ngành',
      dataIndex: 'topic_major',
      key: 'topic_major',
      render: (major) => (major && major.major_title) ? major.major_title : '',
      width: 180,
    },
    {
      title: 'Loại đề tài',
      dataIndex: 'topic_category',
      key: 'topic_category',
      render: (cat) => (cat && (cat.topic_category_title || cat.type_name)) ? (cat.topic_category_title || cat.type_name) : (typeof cat === 'string' ? cat : '-'),
    },
    {
      title: 'Đợt đăng ký',
      dataIndex: 'topic_registration_period',
      key: 'topic_registration_period',
      render: (period) => {
        if (!period) return '-';
        if (typeof period === 'string') return period;
        return period.registration_period_name || period.name || '-';
      },
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
      title: 'Hội đồng',
      dataIndex: 'topic_assembly',
      key: 'topic_assembly',
      render: (assembly) =>
        assembly && assembly.assembly_name
          ? assembly.assembly_name
          : 'Chưa có',
      width: 180,
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
        return status ? (statusMap[status.toLowerCase()] || status) : '-';
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <div className="text-2xl font-bold text-gray-800">Danh sách đề tài</div>
          <Button
            type="primary"
            onClick={handleExportExcel}
            style={{ minWidth: 200, fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}
            icon={<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='currentColor' viewBox='0 0 16 16'><path d='M.5 9.9a.5.5 0 0 1 .5.5V13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2.6a.5.5 0 0 1 1 0V13a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-2.6a.5.5 0 0 1 .5-.5z'/><path d='M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z'/></svg>}
            className="bg-blue-600 hover:bg-blue-700 border-none shadow-md"
          >
            Tải xuống danh sách
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
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
                {faculty.faculty_name}
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
        width={900}
      >
        <div style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 22, color: '#1976d2', marginBottom: 16 }}>Chi tiết đề tài</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Tên đề tài</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                value={selectedThesis?.topic_title || ''}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Hội đồng</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                value={selectedThesis?.topic_assembly?.assembly_name || 'Chưa có'}
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Mô tả đề tài</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                value={selectedThesis?.topic_description || ''}
                rows={3}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Giảng viên hướng dẫn</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                value={selectedThesis?.topic_instructor?.user_name || 'Chưa có GVHD'}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Chuyên ngành</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                value={selectedThesis?.topic_major?.major_title || ''}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Loại đề tài</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                value={selectedThesis?.topic_category?.topic_category_title || ''}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Số lượng thực hiện</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                value={selectedThesis?.topic_max_members || ''}
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Đề cương xin hướng dẫn:</label>
              {selectedThesis?.topic_advisor_request && typeof selectedThesis.topic_advisor_request === 'string' && (selectedThesis.topic_advisor_request.startsWith('http') || selectedThesis.topic_advisor_request.startsWith('/uploads')) ? (
                <a href={selectedThesis.topic_advisor_request} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Xem file</a>
              ) : selectedThesis?.topic_advisor_request === 'Đã chấp nhận' ? (
                <span className="text-green-600">Đã chấp nhận</span>
              ) : (
              <div className="text-red-500">✗ Chưa có file</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Đề cương:</label>
              {selectedThesis?.topic_defense_request && typeof selectedThesis.topic_defense_request === 'string' && (selectedThesis.topic_defense_request.startsWith('http') || selectedThesis.topic_defense_request.startsWith('/uploads')) ? (
                <a href={selectedThesis.topic_defense_request} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Xem file</a>
              ) : selectedThesis?.topic_defense_request === 'Đã chấp nhận' ? (
                <span className="text-green-600">Đã chấp nhận</span>
              ) : (
              <div className="text-red-500">✗ Chưa có file</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Báo cáo tổng kết:</label>
              {selectedThesis?.topic_final_report_file && typeof selectedThesis.topic_final_report_file === 'string' && (selectedThesis.topic_final_report_file.startsWith('http') || selectedThesis.topic_final_report_file.startsWith('/uploads')) ? (
                <a href={selectedThesis.topic_final_report_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Xem file</a>
              ) : selectedThesis?.topic_final_report_file === 'Đã chấp nhận' ? (
                <span className="text-green-600">Đã chấp nhận</span>
              ) : (
              <div className="text-red-500">✗ Chưa có file</div>
              )}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-1">Nhóm thực hiện</label>
            <table className="w-full border border-gray-200 rounded mt-2">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">STT</th>
                  <th className="border px-2 py-1">Họ tên</th>
                  <th className="border px-2 py-1">MSSV</th>
                  <th className="border px-2 py-1">Xem điểm</th>
                </tr>
              </thead>
              <tbody>
                {(selectedThesis?.topic_group_student || []).map((sv, idx) => (
                  <tr key={sv._id}>
                    <td className="border px-2 py-1 text-center">{idx + 1}</td>
                    <td className="border px-2 py-1">{sv.user_name}</td>
                    <td className="border px-2 py-1">{sv.user_id}</td>
                    <td className="border px-2 py-1 text-center">
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewScore(sv)}
                        size="small"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              type="primary"
              loading={closeTopicLoading}
              disabled={!allStudentsHaveScores}
              onClick={async () => {
                setCloseTopicLoading(true);
                setCloseTopicError('');
                try {
                  const token = localStorage.getItem('token');
                  const res = await axios.post(`/api/topics/${selectedThesis._id}/close`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  setTheses(prev => prev.map(t =>
                    t._id === selectedThesis._id ? { ...t, topic_teacher_status: 'completed' } : t
                  ));
                  setIsViewModalVisible(false);
                  setNotifyModal({ open: true, message: res.data?.message || 'Đã đóng đề tài thành công!', type: 'success' });
                } catch (err) {
                  let msg = 'Đóng đề tài thất bại!';
                  if (err.response && err.response.data && err.response.data.message) {
                    msg = err.response.data.message;
                  } else if (err.message) {
                    msg = err.message;
                  }
                  setNotifyModal({ open: true, message: msg, type: 'error' });
                  setCloseTopicError(msg);
                } finally {
                  setCloseTopicLoading(false);
                }
              }}
            >
              Đóng đề tài
            </Button>
          </div>
          {!allStudentsHaveScores && (
            <div className="text-red-500 text-xs mt-2">
              Tất cả sinh viên phải có đủ điểm cá nhân (GVHD và 3 điểm hội đồng) mới được đóng đề tài.
            </div>
          )}
          {closeTopicError && (
            <div className="text-red-500 text-xs mt-2">{closeTopicError}</div>
          )}
        </div>
      </Modal>

      <Modal
        open={notifyModal.open}
        onOk={() => setNotifyModal({ ...notifyModal, open: false })}
        onCancel={() => setNotifyModal({ ...notifyModal, open: false })}
        okText="Đóng"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div className="text-center py-4">
          {notifyModal.type === 'success' ? (
            <span style={{ fontSize: 48, color: '#52c41a' }}>✔️</span>
          ) : (
            <span style={{ fontSize: 48, color: '#ff4d4f' }}>❌</span>
          )}
          <p className="mt-4 text-lg">{notifyModal.message}</p>
        </div>
      </Modal>

      <Modal
        title="Điểm cá nhân"
        open={personalScoreModal.open}
        onCancel={() => setPersonalScoreModal({ ...personalScoreModal, open: false })}
        footer={null}
        width={800}
      >
        <div style={{ padding: 24 }}>
          {personalScoreModal.loading ? (
            <div>Đang tải điểm...</div>
          ) : (
            <>
              <h2 style={{ fontWeight: 700, fontSize: 22, color: '#1976d2', marginBottom: 16 }}>Điểm cá nhân</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tên sinh viên</label>
                  <input
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    value={personalScoreModal.student?.user_name || ''}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">MSSV</label>
                  <input
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    value={personalScoreModal.student?.user_id || ''}
                    disabled
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Điểm</label>
                  <input
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    value={personalScoreModal.data?.weightedTotalScore || ''}
                    disabled
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-1">Chi tiết điểm</label>
                <table className="w-full border border-gray-200 rounded mt-2">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">STT</th>
                      <th className="border px-2 py-1">Người chấm</th>
                      <th className="border px-2 py-1">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(personalScoreModal.data?.scores || []).map((score, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1 text-center">{idx + 1}</td>
                        <td className="border px-2 py-1">{score.evaluatorName}</td>
                        <td className="border px-2 py-1">{score.totalScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ThesisList; 