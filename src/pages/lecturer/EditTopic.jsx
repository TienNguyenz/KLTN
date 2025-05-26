import React, { useState, useEffect } from 'react';
import { Button, Spin, Alert, Input, Select, Form, Card, message, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaSave, FaArrowLeft, FaTrash, FaPaperPlane } from 'react-icons/fa';

const { TextArea } = Input;
const { Option } = Select;

const EditTopic = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const [semesters, setSemesters] = useState([]);
  const [majors, setMajors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [semRes, majorRes, catRes] = await Promise.all([
          axios.get('/api/semesters'),
          axios.get('/api/majors'),
          axios.get('/api/topics/topic-types')
        ]);
        setSemesters(semRes.data);
        setMajors(majorRes.data);
        setCategories(catRes.data);
      } catch {
        setSemesters([]);
        setMajors([]);
        setCategories([]);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    const loadTopic = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/topics/${id}`);
        console.log('Topic data:', res.data);
        const topicData = res.data && res.data.data ? res.data.data : null;
        if (!topicData) {
          setError('Không có dữ liệu đề tài.');
          setTopic(null);
          return;
        }
        setTopic(topicData);
      } catch (e) {
        setError('Không tìm thấy đề tài hoặc có lỗi khi tải dữ liệu.');
        console.error('Lỗi khi gọi API /api/topics/:id:', e);
      } finally {
        setLoading(false);
      }
    };
    loadTopic();
  }, [id]);

  useEffect(() => {
    if (isEditMode && topic) {
      form.setFieldsValue({
        topic_title: topic.topic_title || '',
        topic_description: topic.topic_description || '',
        topic_major: (topic.topic_major && topic.topic_major._id) || topic.topic_major || '',
        topic_category: (topic.topic_category && topic.topic_category._id) || topic.topic_category || '',
        topic_max_members: topic.topic_max_members || '',
        topic_registration_period: (topic.topic_registration_period && topic.topic_registration_period._id) || topic.topic_registration_period || ''
      });
    }
  }, [isEditMode, topic, form]);

  const handleSubmit = async (values) => {
    try {
      await axios.put(`/api/topics/${id}`, values);
      const res = await axios.get(`/api/topics/${id}`);
      const topicData = res.data && res.data.data ? res.data.data : null;
      if (!topicData) {
        setError('Không có dữ liệu đề tài sau khi cập nhật.');
        setTopic(null);
        setIsEditMode(false);
        return;
      }
      setTopic(topicData);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const handleDelete = async (reason) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Vui lòng đăng nhập lại');
        return;
      }
      const res = await axios.delete(
        `http://localhost:5000/api/topics/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { delete_reason: reason }
        }
      );
      if (res.data?.message?.includes('Đã gửi yêu cầu xóa cho admin')) {
        window.alert('Yêu cầu xóa đã được gửi đến giáo vụ!');
        navigate('/lecturer/topics');
      } else if (res.data?.message?.includes('Xóa đề tài thành công')) {
        window.alert('Xóa đề tài thành công');
        navigate('/lecturer/topics');
      } else {
        window.alert(res.data?.message || 'Thao tác thành công');
        navigate('/lecturer/topics');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        navigate('/login');
      } else {
        message.error(error.response?.data?.message || 'Lỗi khi xóa đề tài');
      }
    }
  };

  const handleSubmitRegister = async () => {
    try {
      await axios.put(`/api/topics/${id}/submit`);
      alert('Đã gửi đề tài lên admin chờ duyệt!');
      // Reload lại dữ liệu đề tài để cập nhật trạng thái
      const res = await axios.get(`/api/topics/${id}`);
      const topicData = res.data && res.data.data ? res.data.data : null;
      if (topicData) setTopic(topicData);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Có lỗi khi gửi duyệt đề tài!');
      }
    }
  };

  // Helper để render an toàn các trường có thể là object hoặc string
  const renderMajor = (major) => {
    if (!major) return '';
    if (typeof major === 'string') return major;
    if (typeof major === 'object') return major.major_name || major.major_title || major.name || '';
    return '';
  };
  const renderCategory = (cat) => {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'object') return cat.type_name || cat.topic_category_title || cat.name || '';
    return '';
  };
  const renderSemester = (sem) => {
    if (!sem) return '';
    if (typeof sem === 'string') return sem;
    if (typeof sem === 'object') return sem.semester || sem.title || '';
    return '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button 
              onClick={() => navigate('/lecturer/topics')} 
              size="small"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  // Chế độ XEM CHI TIẾT
  if (!isEditMode) {
    // Chỉ render khi đã có topic
    if (!topic) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" />
        </div>
      );
    }
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Chi tiết đề tài</h1>
            <Button onClick={() => navigate('/lecturer/topics')} className="bg-gray-400 hover:bg-gray-500 text-white font-semibold border-0 shadow-md flex items-center rounded px-4 py-2">Quay lại</Button>
          </div>
          <div className="space-y-7">
            <div>
              <div className="text-sm text-gray-500 mb-1">Tên đề tài</div>
              <div className="text-xl font-bold text-gray-900 bg-gray-50 rounded px-4 py-2 border border-gray-200">{topic?.topic_title}</div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Chuyên ngành</div>
                <div className="text-base bg-gray-50 rounded px-3 py-1 border border-gray-200 min-h-[40px] flex items-center">{renderMajor(topic?.topic_major)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Loại đề tài</div>
                <div className="text-base bg-gray-50 rounded px-3 py-1 border border-gray-200 min-h-[40px] flex items-center">{renderCategory(topic?.topic_category)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Học kỳ</div>
                <div className="text-base bg-gray-50 rounded px-3 py-1 border border-gray-200 min-h-[40px] flex items-center">{renderSemester(topic?.topic_registration_period)}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Mô tả đề tài</div>
              <div className="text-base whitespace-pre-line border rounded-lg p-4 bg-gray-50 min-h-[100px] border-gray-200">{topic?.topic_description}</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Số lượng sinh viên tối đa</div>
                <div className="text-base font-semibold text-gray-700 bg-gray-50 rounded px-3 py-1 border border-gray-200 min-h-[40px] flex items-center">{topic?.topic_max_members}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Sinh viên thực hiện</div>
                <div className="flex flex-wrap gap-2 mt-1 min-h-[40px]">
                  {topic?.topic_group_student && topic.topic_group_student.length > 0 ? (
                    topic.topic_group_student.map((sv, idx) => (
                      <span key={sv._id || idx} className="inline-block bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm font-medium">
                        {typeof sv === 'string'
                          ? sv
                          : (sv.user_name || sv.name || sv.title || JSON.stringify(sv))}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">Chưa có sinh viên thực hiện</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-row justify-center gap-4 items-center mt-10">
            <Button 
              style={{ display: 'flex', alignItems: 'center', borderRadius: 999, padding: '12px 32px', fontSize: 18, fontWeight: 600, background: '#ef4444', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(239,68,68,0.15)' }}
              className="hover:bg-red-700 shadow-md"
              icon={<FaTrash className="mr-2" />} 
              size="large"
              onClick={() => setDeleteModalVisible(true)}
            >
              Xóa
            </Button>
            <Button 
              style={{ display: 'flex', alignItems: 'center', borderRadius: 999, padding: '12px 32px', fontSize: 18, fontWeight: 600, background: '#22c55e', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(34,197,94,0.15)' }}
              className="hover:bg-green-600 shadow-md"
              icon={<FaPaperPlane className="mr-2" />} 
              size="large"
              onClick={handleSubmitRegister}
            >
              Gửi đăng ký
            </Button>
            <Button 
              type="primary"
              icon={<FaPaperPlane className="mr-2" />} 
              size="large"
              style={{ display: 'flex', alignItems: 'center', borderRadius: 999, padding: '14px 40px', fontSize: 20, fontWeight: 700 }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg"
              onClick={() => setIsEditMode(true)}
              disabled={topic?.topic_group_student && topic.topic_group_student.length > 0}
            >
              Cập nhật đề tài
            </Button>
          </div>
        </Card>
        <Modal
          title="Xác nhận xóa đề tài"
          open={deleteModalVisible}
          onOk={async () => {
            await handleDelete(deleteReason);
            setDeleteModalVisible(false);
            setDeleteReason('');
          }}
          onCancel={() => {
            setDeleteModalVisible(false);
            setDeleteReason('');
          }}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Nhập lý do xóa đề tài:</p>
          <Input.TextArea
            value={deleteReason}
            onChange={e => setDeleteReason(e.target.value)}
            rows={4}
            placeholder="Nhập lý do xóa..."
          />
        </Modal>
      </div>
    );
  }

  // Chế độ CHỈNH SỬA
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="shadow-lg">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa đề tài</h1>
          <Button onClick={() => setIsEditMode(false)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg border-0 flex items-center font-semibold px-6 py-2 rounded-lg">
            <FaArrowLeft className="mr-2" /> Quay lại
          </Button>
      </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            topic_title: topic?.topic_title,
            topic_description: topic?.topic_description,
            topic_major: topic?.topic_major?._id,
            topic_category: topic?.topic_category?._id,
            topic_max_members: topic?.topic_max_members,
            topic_registration_period: topic?.topic_registration_period?._id || topic?.topic_registration_period
          }}
        >
          <div className="grid grid-cols-3 gap-6">
          <Form.Item
              name="topic_registration_period"
              label={<span className="text-gray-700 font-medium">Học kỳ</span>}
              rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
          >
              <Select placeholder="Chọn học kỳ" className="rounded-md">
                {semesters.map(s => (
                  <Option key={s._id} value={s._id}>{s.semester}</Option>
                ))}
              </Select>
          </Form.Item>
            <Form.Item
              name="topic_major"
              label={<span className="text-gray-700 font-medium">Chuyên ngành</span>}
              rules={[{ required: true, message: 'Vui lòng chọn chuyên ngành' }]}
            >
              <Select 
                placeholder="Chọn chuyên ngành"
                className="rounded-md"
              >
                {majors.map(m => (
                  <Option key={m._id} value={m._id}>{m.major_title || m.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="topic_category"
              label={<span className="text-gray-700 font-medium">Loại đề tài</span>}
              rules={[{ required: true, message: 'Vui lòng chọn loại đề tài' }]}
            >
              <Select 
                placeholder="Chọn loại đề tài"
                className="rounded-md"
              >
                {categories.map(c => (
                  <Option key={c._id} value={c._id}>{c.topic_category_title || c.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="topic_title"
            label={<span className="text-gray-700 font-medium">Tên đề tài</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên đề tài' }]}
          >
            <Input 
              placeholder="Nhập tên đề tài" 
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="topic_description"
            label={<span className="text-gray-700 font-medium">Mô tả đề tài</span>}
          >
            <TextArea 
              rows={6} 
              placeholder="Nhập mô tả đề tài"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="topic_max_members"
            label={<span className="text-gray-700 font-medium">Số lượng sinh viên tối đa</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng sinh viên' }]}
          >
            <Input 
              type="number" 
              min={1} 
              max={3}
              className="rounded-md"
            />
          </Form.Item>

          <div className="w-full flex flex-row justify-center gap-4 items-center mt-8">
            <Button 
              style={{ display: 'flex', alignItems: 'center', borderRadius: 999, padding: '12px 32px', fontSize: 18, fontWeight: 600, background: '#ef4444', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(239,68,68,0.15)' }}
              className="hover:bg-red-700 shadow-md"
              icon={<FaTrash className="mr-2" />} 
              size="large"
              onClick={() => setDeleteModalVisible(true)}
            >
              Xóa
            </Button>
            <Button 
              style={{ display: 'flex', alignItems: 'center', borderRadius: 999, padding: '12px 32px', fontSize: 18, fontWeight: 600, background: '#22c55e', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(34,197,94,0.15)' }}
              className="hover:bg-green-600 shadow-md"
              icon={<FaPaperPlane className="mr-2" />} 
              size="large"
              onClick={handleSubmitRegister}
            >
              Gửi đăng ký
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<FaPaperPlane className="mr-2" />} 
              size="large"
              style={{ display: 'flex', alignItems: 'center', borderRadius: 999, padding: '14px 40px', fontSize: 20, fontWeight: 700 }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg"
            >
              Cập nhật đề tài
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EditTopic; 