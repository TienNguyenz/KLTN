import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Table, message, Modal } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const ProposedTopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/topics/${id}`);
        setTopic(res.data.data || res.data);
      } catch {
        message.error('Không thể tải thông tin đề tài!');
      }
      setLoading(false);
    };
    fetchTopic();
  }, [id]);

  const handleViewStudentDetail = async (student) => {
    setSelectedStudentDetail(null);
    setIsStudentDetailModalOpen(true);
    setStudentDetailLoading(true);
    try {
      // Nếu student đã có đủ thông tin thì không cần gọi API
      if (student.email && student.user_id) {
        setSelectedStudentDetail(student);
      } else {
        // Gọi API lấy chi tiết sinh viên theo user_id
        const res = await axios.get(`/api/users/${student.user_id}`);
        setSelectedStudentDetail(res.data.data || res.data);
      }
    } catch {
      setSelectedStudentDetail(null);
      message.error('Không thể tải thông tin sinh viên');
    }
    setStudentDetailLoading(false);
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (!topic) return <div className="p-6">Không tìm thấy thông tin đề tài</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-2">
          Quay lại
        </Button>
      </div>
      <Card className="mb-6">
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Tên đề tài</div>
            <div className="text-base">{topic.topic_title || '-'}</div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Số lượng thực hiện</div>
              <div className="text-base">{topic.topic_max_members ?? '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Chuyên ngành</div>
              <div className="text-base">{topic.topic_major?.major_title || topic.topic_major?.title || topic.topic_major || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Loại đề tài</div>
              <div className="text-base">{topic.topic_category?.topic_category_title || topic.topic_category?.title || topic.topic_category || '-'}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Mô tả đề tài</div>
            <div className="text-base whitespace-pre-line border rounded-md p-4 bg-gray-50 min-h-[100px]" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {topic.topic_description || '-'}
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <Title level={5}>Đơn xin hướng dẫn</Title>
        <div className="flex flex-col items-center justify-center min-h-[120px]">
          <Card
            size="small"
            className="text-center transition-all duration-300 hover:shadow-xl hover:border-[#008bc3] rounded-xl"
            style={{
              border: '1.5px solid #e5e7eb',
              minWidth: 320,
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#f9fafb',
            }}
            bodyStyle={{ padding: 32 }}
          >
            <FileTextOutlined className="text-4xl mb-2 text-[#008bc3]" />
            <div className="font-semibold text-lg mb-2">Đơn xin hướng dẫn</div>
            {topic.topic_advisor_request && topic.topic_advisor_request !== 'Chưa gửi' ? (
              <a
                href={topic.topic_advisor_request}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#008bc3] font-medium hover:underline hover:text-[#005f7f] transition mt-2"
              >
                <span>Xem file đơn xin hướng dẫn</span>
              </a>
            ) : (
              <div className="text-gray-400 flex flex-col items-center">Chưa nộp</div>
            )}
          </Card>
        </div>
      </Card>

      <Card>
        <Title level={5}>Nhóm đăng ký</Title>
        {topic.topic_group_student && topic.topic_group_student.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border rounded-lg shadow-sm bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 border text-center">STT</th>
                  <th className="px-4 py-2 border text-center">Thành viên</th>
                  <th className="px-4 py-2 border text-center">Mã số SV</th>
                  <th className="px-4 py-2 border text-center">Xem thông tin</th>
                </tr>
              </thead>
              <tbody>
                {topic.topic_group_student.map((student, index) => (
                  <tr key={student._id || student.user_id || student.id || index} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-2 border text-center font-semibold">{index + 1}</td>
                    <td className="px-4 py-2 border text-center">{student.user_name || student.name || '-'}</td>
                    <td className="px-4 py-2 border text-center">{student.user_id || '-'}</td>
                    <td className="px-4 py-2 border text-center">
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewStudentDetail(student)}
                        className="text-green-600 hover:text-green-800"
                        style={{ fontSize: 18 }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 mt-4">Chưa có sinh viên đăng ký</div>
        )}
      </Card>
      <Modal
        title="Thông tin sinh viên"
        open={isStudentDetailModalOpen}
        onCancel={() => setIsStudentDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {studentDetailLoading ? (
          <div>Đang tải thông tin sinh viên...</div>
        ) : selectedStudentDetail ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                {selectedStudentDetail.user_avatar ? (
                  <img
                    src={`http://localhost:5000${selectedStudentDetail.user_avatar}`}
                    alt="avatar"
                    className="w-20 h-20 rounded-full border object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-20 h-20 rounded-full border bg-gray-100 flex items-center justify-center"><span class=anticon><svg viewBox=64 64 896 896 focusable=false class=text-4xl text-gray-400 data-icon=user width=1em height=1em fill=currentColor aria-hidden=true></svg></span></div>';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border bg-gray-100 flex items-center justify-center">
                    <UserOutlined className="text-4xl text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedStudentDetail.user_name || '-'}</h3>
                <p className="text-gray-600">MSSV: {selectedStudentDetail.user_id || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><b>Email:</b> {selectedStudentDetail.email || '-'}</div>
              <div><b>Số điện thoại:</b> {selectedStudentDetail.user_phone || '-'}</div>
              <div><b>Ngày sinh:</b> {selectedStudentDetail.user_date_of_birth || '-'}</div>
              <div><b>CCCD:</b> {selectedStudentDetail.user_CCCD || '-'}</div>
              <div className="col-span-2"><b>Địa chỉ thường trú:</b> {selectedStudentDetail.user_permanent_address || '-'}</div>
              <div className="col-span-2"><b>Địa chỉ tạm trú:</b> {selectedStudentDetail.user_temporary_address || '-'}</div>
              <div><b>Khoa:</b> {selectedStudentDetail.user_faculty?.faculty_title || selectedStudentDetail.user_faculty || '-'}</div>
              <div><b>Ngành:</b> {selectedStudentDetail?.user_major?.major_title || selectedStudentDetail?.user_major || '-'}</div>
              <div><b>Điểm TB:</b> {selectedStudentDetail.user_average_grade || '-'}</div>
              <div><b>Trạng thái:</b> {selectedStudentDetail.user_status || '-'}</div>
            </div>
            {selectedStudentDetail.user_transcript && (
              <div className="mt-4">
                <b>Bảng điểm:</b>
                <a 
                  href={selectedStudentDetail.user_transcript}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Xem bảng điểm
                </a>
              </div>
            )}
          </div>
        ) : (
          <div>Không tìm thấy thông tin sinh viên</div>
        )}
      </Modal>
    </div>
  );
};

export default ProposedTopicDetail; 