import React, { useState, useEffect } from 'react';
import { Button, Spin, Alert, Input, Select, Form } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaSave } from 'react-icons/fa';

const { TextArea } = Input;
const { Option } = Select;

const EditTopic = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const loadTopic = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/topics/${id}`);
        setTopic(res.data);
        form.setFieldsValue({
          topic_title: res.data.topic_title,
          topic_description: res.data.topic_description,
          topic_major: res.data.topic_major?._id,
          topic_category: res.data.topic_category?._id,
          topic_max_members: res.data.topic_max_members
        });
      } catch (err) {
        setError('Không tìm thấy đề tài hoặc có lỗi khi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    loadTopic();
  }, [id, form]);

  const handleSubmit = async (values) => {
    try {
      await axios.put(`/api/topics/${id}`, values);
      navigate('/lecturer/topics');
    } catch (err) {
      console.error('Error updating topic:', err);
    }
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
            <Button onClick={() => navigate('/lecturer/topics')} size="small">
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chỉnh sửa đề tài</h1>
        <Button onClick={() => navigate('/lecturer/topics')}>Quay lại</Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            topic_title: topic?.topic_title,
            topic_description: topic?.topic_description,
            topic_major: topic?.topic_major?._id,
            topic_category: topic?.topic_category?._id,
            topic_max_members: topic?.topic_max_members
          }}
        >
          <Form.Item
            name="topic_title"
            label="Tên đề tài"
            rules={[{ required: true, message: 'Vui lòng nhập tên đề tài' }]}
          >
            <Input placeholder="Nhập tên đề tài" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-6">
            <Form.Item
              name="topic_major"
              label="Chuyên ngành"
              rules={[{ required: true, message: 'Vui lòng chọn chuyên ngành' }]}
            >
              <Select placeholder="Chọn chuyên ngành">
                <Option value="CNTT">Công nghệ thông tin</Option>
                <Option value="CNPM">Công nghệ phần mềm</Option>
                <Option value="HTTT">Hệ thống thông tin</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="topic_category"
              label="Loại đề tài"
              rules={[{ required: true, message: 'Vui lòng chọn loại đề tài' }]}
            >
              <Select placeholder="Chọn loại đề tài">
                <Option value="KLTN">Khóa luận tốt nghiệp</Option>
                <Option value="TTTN">Thực tập tốt nghiệp</Option>
                <Option value="NCKH">Nghiên cứu khoa học</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="topic_description"
            label="Mô tả đề tài"
          >
            <TextArea rows={6} placeholder="Nhập mô tả đề tài" />
          </Form.Item>

          <Form.Item
            name="topic_max_members"
            label="Số lượng sinh viên tối đa"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng sinh viên' }]}
          >
            <Input type="number" min={1} max={3} />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Button type="primary" htmlType="submit" icon={<FaSave className="mr-2" />} size="large">
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default EditTopic; 