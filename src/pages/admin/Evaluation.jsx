import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, InputNumber, Steps, notification } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import axios from 'axios';

// Đảm bảo notification luôn hiển thị trên modal
notification.config({
  placement: 'topRight',
  top: 64 // Đẩy xuống một chút để không bị che bởi header hoặc modal
});

const Evaluation = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCriteriaCountModalVisible, setIsCriteriaCountModalVisible] = useState(false);
  const [isCriteriaFormVisible, setIsCriteriaFormVisible] = useState(false);
  const [isViewCriteriaModalVisible, setIsViewCriteriaModalVisible] = useState(false);
  const [criteriaCount, setCriteriaCount] = useState(5);
  const [currentCriteriaStep, setCurrentCriteriaStep] = useState(0);
  const [form] = Form.useForm();
  const [criteriaForm] = Form.useForm();
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState(null);
  const [topicCategories, setTopicCategories] = useState([]);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);

  // Dữ liệu mẫu cho tiêu chí
  const criteriaData = [
    {
      id: 1,
      name: 'Tiêu chí 1',
      maxScore: 10,
      weight: 50,
      isEditing: false
    },
    {
      id: 2,
      name: 'Tiêu chí 2',
      maxScore: 10,
      weight: 50,
      isEditing: false
    }
  ];

  const [criteria, setCriteria] = useState(criteriaData);

  // Columns cho bảng tiêu chí trong modal xem
  const criteriaColumns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },
    {
      title: 'Tên tiêu chí',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (text, record) => (
        record.isEditing ? (
          <span>{text}</span>
        ) : text
      )
    },
    {
      title: 'Thang điểm',
      dataIndex: 'maxScore',
      key: 'maxScore',
      width: '20%',
      render: (text, record) => (
        record.isEditing ? (
          <InputNumber
            min={1}
            max={10}
            defaultValue={record.maxScore}
            onChange={(value) => handleCriteriaChange(record.id, 'maxScore', value)}
          />
        ) : text
      )
    },
    {
      title: 'Trọng số',
      dataIndex: 'weight',
      key: 'weight',
      width: '20%',
      render: (text, record) => (
        record.isEditing ? (
          <InputNumber
            min={0}
            max={100}
            value={record.weight * 100}
            onChange={(value) => handleCriteriaChange(record.id, 'weight', value / 100)}
          />
        ) : `${(record.weight * 100).toFixed(0)}%`
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.isEditing ? (
            <Space.Compact className="flex">
              <Button
                type="text"
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-100"
                onClick={() => handleSaveCriteria(record.id)}
                icon={<CheckOutlined style={{ color: '#52c41a' }} className="text-lg" />}
              />
              <Button
                type="text"
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100"
                onClick={() => handleCancelEdit(record.id)}
                icon={<CloseOutlined style={{ color: '#ff4d4f' }} className="text-lg" />}
              />
            </Space.Compact>
          ) : (
            <Space.Compact className="flex">
              <Button
                type="text"
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-100"
                onClick={() => handleEditCriteria(record.id)}
                icon={<FaEdit style={{ color: '#4096ff' }} className="text-lg" />}
              />
              <Button
                type="text"
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100"
                onClick={() => handleDeleteEvaluation(record)}
                icon={<FaTrash style={{ color: '#ff4d4f' }} className="text-lg" />}
              />
            </Space.Compact>
          )}
        </Space>
      ),
    },
  ];

  const columns = [
    {
      title: 'Tên phiếu',
      dataIndex: 'rubric_name',
      key: 'rubric_name',
      width: '40%',
    },
    {
      title: 'Loại đề tài',
      dataIndex: 'rubric_topic_category',
      key: 'rubric_topic_category',
      width: '20%',
      render: (catId) => {
        const cat = topicCategories.find(c => c._id === catId);
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{cat ? cat.topic_category_title : catId}</span>;
      },
    },
    {
      title: 'Tiêu chí',
      dataIndex: 'rubric_evaluations',
      key: 'rubric_evaluations',
      width: '20%',
      render: (arr) => arr?.length || 0,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space.Compact className="flex">
          <Button
            type="text"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-100"
            onClick={() => handleAddCriteria(record)}
            icon={<FaEdit style={{ color: '#4096ff' }} className="text-lg" />}
          />
          <Button
            type="text"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-100"
            onClick={() => handleViewCriteria(record)}
            icon={<FaEye style={{ color: '#52c41a' }} className="text-lg" />}
          />
          <Button
            type="text"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100"
            onClick={() => handleDeleteRubric(record)}
            icon={<FaTrash style={{ color: '#ff4d4f' }} className="text-lg" />}
          />
        </Space.Compact>
      ),
    },
  ];

  const handleAddCriteria = (rubric) => {
    setSelectedRubric(rubric);
    setIsUpdatingExisting(true);
    // Fetch current criteria first
    fetchCriteriaForRubric(rubric._id).then(() => {
      setIsCriteriaCountModalVisible(true);
    });
  };

  const handleCriteriaCountSubmit = () => {
    if (criteriaCount > 0) {
      setIsCriteriaCountModalVisible(false);
      setIsCriteriaFormVisible(true);
      
      // Nếu đang cập nhật tiêu chí hiện có
      if (isUpdatingExisting) {
        // Hiển thị tiêu chí đầu tiên để chỉnh sửa
        const firstCriteria = criteria[0];
        if (firstCriteria) {
          criteriaForm.setFieldsValue({
            name: firstCriteria.name,
            description: firstCriteria.note || '',
            maxScore: firstCriteria.maxScore,
            weight: firstCriteria.weight * 100
          });
        }
        setCurrentCriteriaStep(0);
      } else {
        setCurrentCriteriaStep(0);
      }
    }
  };

  const handleCriteriaFormSubmit = async () => {
    console.log('Đã nhấn Tiếp tục');
    try {
      const values = await criteriaForm.validateFields();
      const rubricId = selectedRubric?._id;
      if (!rubricId) {
        message.error('Không xác định được phiếu đánh giá!');
        return;
      }

      // Kiểm tra tên tiêu chí không trùng (trừ chính tiêu chí đang sửa)
      const currentName = (values.name || '').trim();
      const existingNames = criteria.map((c, idx) => idx !== currentCriteriaStep ? (c.name || '').trim() : null).filter(Boolean);
      if (existingNames.includes(currentName)) {
        message.error('Tên tiêu chí không được trùng trong cùng một phiếu đánh giá!');
        return;
      }

      // Chuẩn hóa dữ liệu
      const apiData = {
        rubric_id: rubricId,
        serial: currentCriteriaStep + 1,
        evaluation_criteria: values.name,
        grading_scale: Number(values.maxScore),
        weight: values.weight / 100,
        level_core: '',
        note: values.description || ''
      };

      let updatedCriteria = [...criteria];
      let apiRes = null;
      // Nếu đang cập nhật tiêu chí hiện có
      if (isUpdatingExisting && currentCriteriaStep < criteria.length) {
        const currentCriteria = criteria[currentCriteriaStep];
        if (currentCriteria._id) {
          // Update existing criteria
          apiRes = await axios.put(`http://localhost:5000/api/evaluations/${currentCriteria._id}`, apiData);
          window.alert('Cập nhật tiêu chí thành công!');
          updatedCriteria[currentCriteriaStep] = {
            ...currentCriteria,
            name: values.name,
            maxScore: Number(values.maxScore),
            weight: values.weight / 100,
            note: values.description || '',
            _id: currentCriteria._id
          };
        } else {
          // Nếu không có _id, tạo mới
          apiRes = await axios.post('http://localhost:5000/api/evaluations', apiData);
          window.alert('Thêm tiêu chí thành công!');
          updatedCriteria[currentCriteriaStep] = {
            ...currentCriteria,
            name: values.name,
            maxScore: Number(values.maxScore),
            weight: values.weight / 100,
            note: values.description || '',
            _id: apiRes?.data?._id
          };
        }
      } else {
        // Thêm tiêu chí mới
        apiRes = await axios.post('http://localhost:5000/api/evaluations', apiData);
        window.alert('Thêm tiêu chí thành công!');
        updatedCriteria.push({
          id: currentCriteriaStep + 1,
          name: values.name,
          maxScore: Number(values.maxScore),
          weight: values.weight / 100,
          note: values.description || '',
          isEditing: false,
          _id: apiRes?.data?._id
        });
      }

      // Chuyển bước hoặc kết thúc
      const nextStep = currentCriteriaStep + 1;
      setCriteria(updatedCriteria);
      setCurrentCriteriaStep(nextStep);
      if (nextStep < criteria.length) {
        // Chuyển sang tiêu chí tiếp theo
        const nextCriteria = updatedCriteria[nextStep];
        criteriaForm.setFieldsValue({
          name: nextCriteria.name,
          description: nextCriteria.note || '',
          maxScore: nextCriteria.maxScore,
          weight: nextCriteria.weight * 100
        });
      } else if (nextStep < criteriaCount) {
        // Hết tiêu chí cũ, chuyển sang nhập mới
        criteriaForm.resetFields();
      } else {
        // Đã nhập hết
        const allWeights = updatedCriteria.map(c => Number(c.weight));
        const totalWeight = allWeights.reduce((sum, w) => sum + w, 0);
        if (totalWeight !== 1) {
          message.error('Tổng trọng số của tất cả tiêu chí phải đúng 100%!');
          return;
        }
        await fetchCriteriaForRubric(rubricId);
        window.alert('Hoàn thành cập nhật tiêu chí!');
        setIsCriteriaFormVisible(false);
        criteriaForm.resetFields();
        setCurrentCriteriaStep(0);
        setIsUpdatingExisting(false);
      }
    } catch (err) {
      message.error('Lưu tiêu chí thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteRubric = (rubric) => {
    if (!rubric._id) {
      alert('Không tìm thấy ID của rubric!');
      return;
    }
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa phiếu đánh giá "${rubric.rubric_name || rubric.name}"?`);
    if (confirmDelete) {
      axios.delete(`http://localhost:5000/api/rubrics/${rubric._id}`)
        .then(() => {
          alert('Đã xóa phiếu đánh giá thành công!');
          fetchRubrics();
        })
        .catch((err) => {
          const errorMessage = err.response?.data?.message || err.message;
          alert(`Xóa phiếu đánh giá thất bại: ${errorMessage}`);
        });
    }
  };

  const handleDeleteEvaluation = (evaluation) => {
    if (!evaluation._id) {
      alert('Không tìm thấy ID của tiêu chí!');
      return;
    }
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa tiêu chí "${evaluation.name || evaluation.evaluation_criteria}"?`);
    if (confirmDelete) {
      axios.delete(`http://localhost:5000/api/evaluations/${evaluation._id}`)
        .then(() => {
          alert('Đã xóa tiêu chí thành công!');
          if (selectedRubric?._id) fetchCriteriaForRubric(selectedRubric._id);
          fetchRubrics();
        })
        .catch((err) => {
          const errorMessage = err.response?.data?.message || err.message;
          alert(`Xóa tiêu chí thất bại: ${errorMessage}`);
        });
    }
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log('Form values:', values);
      try {
        // Chuyển đổi type thành rubric_category theo yêu cầu của API
        const apiData = {
          rubric_name: values.name,
          rubric_note: values.description,
          rubric_category: 3, // Đã bỏ trường type
          rubric_topic_category: values.topicCategory,
          rubric_template: '' // Thêm trường này nếu cần
        };

        console.log('Sending data to API:', apiData);

        // Gọi API để thêm phiếu đánh giá
        axios.post('http://localhost:5000/api/rubrics', apiData)
          .then((response) => {
            console.log('API Response:', response.data);
            alert('Thêm phiếu đánh giá mới thành công!');
            form.resetFields();
            setIsModalVisible(false);
            fetchRubrics();
          })
          .catch((err) => {
            console.error('Error adding rubric:', err);
            console.error('Dữ liệu gửi lên:', apiData);
            let errorMessage = 'Thêm phiếu đánh giá thất bại';
            if (err.response) {
              console.error('Lỗi trả về từ backend:', err.response.data);
              errorMessage = err.response.data.message || JSON.stringify(err.response.data);
            } else {
              errorMessage = err.message;
            }
            alert(`Thêm phiếu đánh giá thất bại: ${errorMessage}`);
          });
      } catch (err) {
        console.error('Error in form submission:', err);
        alert('Có lỗi xảy ra khi thêm phiếu đánh giá');
      }
    }).catch((error) => {
      console.error('Form validation error:', error);
      alert('Vui lòng kiểm tra lại thông tin đã nhập!');
    });
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleViewCriteria = async (rubric) => {
    setSelectedRubric(rubric);
    // Fetch lại dữ liệu tiêu chí mới nhất từ server
    await fetchCriteriaForRubric(rubric._id);
    setIsViewCriteriaModalVisible(true);
  };

  const handleCriteriaChange = (criteriaId, field, value) => {
    setCriteria(criteria.map(item =>
      item.id === criteriaId ? { 
        ...item, 
        [field]: value,
        // Nếu đang thay đổi description, cập nhật cả note
        ...(field === 'description' ? { note: value } : {})
      } : item
    ));
  };

  const handleSaveCriteria = async (criteriaId) => {
    const edited = criteria.find(item => item.id === criteriaId);
    if (!edited) return;

    // Chuẩn hóa dữ liệu gửi đi
    const apiData = {
      rubric_id: selectedRubric?._id,
      serial: edited.serial || edited.id || 1,
      evaluation_criteria: edited.name,
      grading_scale: edited.maxScore,
      weight: edited.weight,
      level_core: edited.level_core || '',
      note: edited.note || edited.description || '' // Thêm description vào đây
    };

    try {
      if (edited._id) {
        // Update
        await axios.put(`http://localhost:5000/api/evaluations/${edited._id}`, apiData);
        window.alert('Cập nhật tiêu chí thành công!');
        setIsViewCriteriaModalVisible(false);
        await fetchCriteriaForRubric(selectedRubric._id);
      } else {
        // Create
        await axios.post('http://localhost:5000/api/evaluations', apiData);
        window.alert('Thêm tiêu chí thành công!');
      }

      setCriteria(criteria.map(item =>
        item.id === criteriaId ? { ...item, isEditing: false } : item
      ));
    } catch (err) {
      message.error('Lưu tiêu chí thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelEdit = (criteriaId) => {
    setCriteria(criteria.map(item =>
      item.id === criteriaId ? { ...item, isEditing: false } : item
    ));
  };

  const handleEditCriteria = (criteriaId) => {
    setCriteria(criteria.map(item =>
      item.id === criteriaId ? { ...item, isEditing: true } : item
    ));
    const editing = criteria.find(item => item.id === criteriaId);
    if (editing) {
      criteriaForm.setFieldsValue({
        name: editing.name,
        description: editing.note || '',
        maxScore: editing.maxScore,
        weight: editing.weight * 100
      });
    }
  };

  // Thêm hàm fetch tiêu chí cho rubric
  const fetchCriteriaForRubric = async (rubricId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/rubrics/${rubricId}`);
      if (res.data && res.data.rubric_evaluations) {
        setCriteria(
          res.data.rubric_evaluations.map((e, idx) => ({
            id: idx + 1,
            name: e.evaluation_criteria,
            maxScore: e.grading_scale,
            weight: e.weight,
            note: e.note,
            isEditing: false,
            _id: e._id
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching criteria:', err);
      message.error('Không thể tải lại tiêu chí!');
    }
  };

  useEffect(() => {
    fetchRubrics();
    fetchTopicCategories();
  }, []);

  const fetchRubrics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/rubrics');
      console.log('Fetched rubrics:', res.data);
      setRubrics(res.data);
    } catch (error) {
      console.error('Error fetching rubrics:', error);
      message.error('Không thể tải danh sách rubric');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/topics/topic-types');
      console.log('Fetched topic categories:', res.data);
      if (res.data && res.data.data) {
        setTopicCategories(res.data.data);
      } else {
        console.error('Invalid topic categories data format:', res.data);
        message.error('Dữ liệu loại đề tài không đúng định dạng');
      }
    } catch (error) {
      console.error('Error fetching topic categories:', error);
      message.error('Không thể tải danh sách loại đề tài');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Phiếu đánh giá</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="bg-blue-600"
        >
          Thêm Phiếu đánh giá
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={rubrics}
          loading={loading}
          rowKey="_id"
          pagination={{
            total: rubrics.length,
            pageSize: 5,
            showTotal: (total) => `Tổng cộng ${total} phiếu đánh giá`,
          }}
        />
      </div>

      {/* Modal tạo phiếu đánh giá */}
      <Modal
        title="Tạo phiếu đánh giá"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Tạo mới"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          name="evaluationForm"
          initialValues={{
            name: '',
            description: '',
            type: undefined,
            topicCategory: undefined
          }}
        >
          <Form.Item
            name="name"
            label="Tên phiếu đánh giá"
            rules={[{ required: true, message: 'Vui lòng nhập tên phiếu đánh giá!' }]}
          >
            <Input placeholder="Nhập tên phiếu đánh giá" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả phiếu đánh giá"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả phiếu đánh giá!' }]}
          >
            <Input.TextArea placeholder="Nhập mô tả phiếu đánh giá" />
          </Form.Item>

          <Form.Item
            name="topicCategory"
            label="Loại đề tài"
            rules={[{ required: true, message: 'Vui lòng chọn loại đề tài!' }]}
          >
            <Select placeholder="Vui lòng chọn">
              {topicCategories.map(category => (
                <Select.Option key={category._id} value={category._id}>
                  {category.topic_category_title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal nhập số lượng tiêu chí */}
      <Modal
        title="Số lượng tiêu chí"
        open={isCriteriaCountModalVisible}
        onOk={handleCriteriaCountSubmit}
        onCancel={() => setIsCriteriaCountModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div className="flex items-center justify-center space-x-4">
          <Button 
            type="primary" 
            danger
            onClick={() => setCriteriaCount(Math.max(1, criteriaCount - 1))}
          >
            -
          </Button>
          <Input 
            className="w-20 text-center" 
            value={criteriaCount}
            readOnly
          />
          <Button 
            type="primary" 
            className="bg-green-600"
            onClick={() => setCriteriaCount(criteriaCount + 1)}
          >
            +
          </Button>
        </div>
      </Modal>

      {/* Modal tạo tiêu chí */}
      <Modal
        title={`Tạo tiêu chí ${currentCriteriaStep + 1}/${criteriaCount}`}
        open={isCriteriaFormVisible}
        onOk={handleCriteriaFormSubmit}
        onCancel={() => {
          setIsCriteriaFormVisible(false);
          setCurrentCriteriaStep(0);
        }}
        okText={currentCriteriaStep === criteriaCount - 1 ? "Hoàn thành" : "Tiếp tục"}
        cancelText="Hủy"
        okType="primary"
      >
        <Steps
          current={currentCriteriaStep}
          items={Array(criteriaCount).fill(0).map((_, index) => ({
            title: `Tiêu chí ${index + 1}`,
          }))}
          className="mb-6"
        />
        <Form
          form={criteriaForm}
          layout="vertical"
          name="criteriaForm"
        >
          <Form.Item
            name="name"
            label="Tên tiêu chí"
            rules={[{ required: true, message: 'Vui lòng nhập tên tiêu chí!' }]}
          >
            <Input placeholder="Nhập tên tiêu chí" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả tiêu chí"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả tiêu chí!' }]}
          >
            <Input.TextArea placeholder="Nhập mô tả tiêu chí" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="maxScore"
              label="Thang điểm"
              rules={[{ required: true, message: 'Vui lòng nhập thang điểm!' }]}
            >
              <InputNumber className="w-full" min={1} max={10} placeholder="Nhập thang điểm" />
            </Form.Item>

            <Form.Item
              name="weight"
              label="Trọng số (%)"
              rules={[{ required: true, message: 'Vui lòng nhập trọng số!' }]}
            >
              <InputNumber 
                className="w-full" 
                min={0} 
                max={100}
                placeholder="Nhập trọng số"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Modal xem và cập nhật tiêu chí */}
      <Modal
        title="Tiêu chí của phiếu đánh giá"
        open={isViewCriteriaModalVisible}
        onCancel={() => setIsViewCriteriaModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={criteriaColumns}
          dataSource={criteria}
          pagination={false}
          rowKey="id"
        />
      </Modal>
    </div>
  );
};

export default Evaluation; 