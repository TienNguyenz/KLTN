import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, InputNumber, Steps } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const Evaluation = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCriteriaCountModalVisible, setIsCriteriaCountModalVisible] = useState(false);
  const [isCriteriaFormVisible, setIsCriteriaFormVisible] = useState(false);
  const [isViewCriteriaModalVisible, setIsViewCriteriaModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [criteriaCount, setCriteriaCount] = useState(5);
  const [currentCriteriaStep, setCurrentCriteriaStep] = useState(0);
  const [form] = Form.useForm();
  const [criteriaForm] = Form.useForm();
  const [assignForm] = Form.useForm();

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
          <Input 
            defaultValue={text}
            onChange={(e) => handleCriteriaChange(record.id, 'name', e.target.value)}
          />
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
            min={0}
            max={10}
            defaultValue={text}
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
            defaultValue={text}
            onChange={(value) => handleCriteriaChange(record.id, 'weight', value)}
          />
        ) : `${text}%`
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
                onClick={() => handleDelete(record)}
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
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    },
    {
      title: 'Đánh cho',
      dataIndex: 'type',
      key: 'type',
      width: '20%',
      render: (type) => {
        const types = {
          supervisor: 'GVHD',
          reviewer: 'GVPB',
          committee: 'Hội đồng',
        };
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{types[type] || type}</span>;
      },
    },
    {
      title: 'Tiêu chí',
      dataIndex: 'criteriaCount',
      key: 'criteriaCount',
      width: '20%',
      render: (count) => count || 0,
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
            onClick={() => handleDelete(record)}
            icon={<FaTrash style={{ color: '#ff4d4f' }} className="text-lg" />}
          />
        </Space.Compact>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      name: 'PHIẾU ĐÁNH GIÁ ĐỒ ÁN TỐT NGHIỆP DANH CHO GVHD',
      type: 'supervisor',
      criteriaCount: 8,
    },
    {
      key: '2',
      name: 'PHIẾU ĐÁNH GIÁ ĐỒ ÁN TỐT NGHIỆP DANH CHO GVPB',
      type: 'reviewer',
      criteriaCount: 3,
    },
    {
      key: '3',
      name: 'PHIẾU ĐÁNH GIÁ ĐỒ ÁN TỐT NGHIỆP DANH CHO HỘI ĐỒNG',
      type: 'committee',
      criteriaCount: 2,
    },
  ];

  const handleAddCriteria = (record) => {
    setIsCriteriaCountModalVisible(true);
  };

  const handleCriteriaCountSubmit = () => {
    if (criteriaCount > 0) {
      setIsCriteriaCountModalVisible(false);
      setIsCriteriaFormVisible(true);
      setCurrentCriteriaStep(0);
    }
  };

  const handleCriteriaFormSubmit = () => {
    criteriaForm.validateFields().then((values) => {
      console.log('Criteria Form Values:', values);
      if (currentCriteriaStep < criteriaCount - 1) {
        setCurrentCriteriaStep(currentCriteriaStep + 1);
        criteriaForm.resetFields();
      } else {
        message.success('Đã thêm tiêu chí thành công');
        setIsCriteriaFormVisible(false);
        criteriaForm.resetFields();
        setCurrentCriteriaStep(0);
      }
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa phiếu đánh giá "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        message.success('Đã xóa phiếu đánh giá thành công');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log('Success:', values);
      message.success('Thêm phiếu đánh giá mới thành công');
      form.resetFields();
      setIsModalVisible(false);
    });
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleViewCriteria = (record) => {
    setIsViewCriteriaModalVisible(true);
  };

  const handleEditCriteria = (criteriaId) => {
    setCriteria(criteria.map(item => 
      item.id === criteriaId ? { ...item, isEditing: true } : item
    ));
  };

  const handleCriteriaChange = (criteriaId, field, value) => {
    setCriteria(criteria.map(item =>
      item.id === criteriaId ? { ...item, [field]: value } : item
    ));
  };

  const handleSaveCriteria = (criteriaId) => {
    setCriteria(criteria.map(item =>
      item.id === criteriaId ? { ...item, isEditing: false } : item
    ));
    message.success('Cập nhật tiêu chí thành công');
  };

  const handleCancelEdit = (criteriaId) => {
    setCriteria(criteria.map(item =>
      item.id === criteriaId ? { ...item, isEditing: false } : item
    ));
  };

  const handleAssignModalOk = () => {
    assignForm.validateFields().then((values) => {
      console.log('Assignment Values:', values);
      message.success('Phân công rubric thành công');
      assignForm.resetFields();
      setIsAssignModalVisible(false);
    });
  };

  const handleAssignModalCancel = () => {
    assignForm.resetFields();
    setIsAssignModalVisible(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Phiếu đánh giá</h1>
        <Space>
          <Button
            type="primary"
            className="bg-indigo-600"
            onClick={() => setIsAssignModalVisible(true)}
          >
            + Phân công rubric
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            className="bg-blue-600"
          >
            Tạo mới rubric
          </Button>
        </Space>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            total: data.length,
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
        >
          <Form.Item
            name="name"
            label="Tên phiếu đánh giá"
            rules={[{ required: true, message: 'Vui lòng nhập tên phiếu đánh giá!' }]}
          >
            <Input placeholder="Nhập tên phiếu đánh giá" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Phiếu đánh giá dành cho"
            rules={[{ required: true, message: 'Vui lòng chọn đối tượng đánh giá!' }]}
          >
            <Select placeholder="Vui lòng chọn">
              <Select.Option value="supervisor">Giảng viên hướng dẫn</Select.Option>
              <Select.Option value="reviewer">Giảng viên phản biện</Select.Option>
              <Select.Option value="committee">Hội đồng bảo vệ</Select.Option>
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
              <InputNumber 
                className="w-full" 
                min={0} 
                max={10}
                placeholder="Nhập thang điểm"
              />
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

      {/* Modal phân công rubric */}
      <Modal
        title="Phân công rubric"
        open={isAssignModalVisible}
        onOk={handleAssignModalOk}
        onCancel={handleAssignModalCancel}
        okText="Phân công"
        cancelText="Hủy"
        width={800}
      >
        <Form
          form={assignForm}
          layout="vertical"
          name="assignForm"
        >
          <Form.Item
            name="topic"
            label="Đề tài"
            rules={[{ required: true, message: 'Vui lòng chọn đề tài!' }]}
          >
            <Select
              showSearch
              placeholder="Chọn đề tài"
              optionFilterProp="children"
            >
              <Select.Option value="topic1">Đề tài 1</Select.Option>
              <Select.Option value="topic2">Đề tài 2</Select.Option>
              <Select.Option value="topic3">Đề tài 3</Select.Option>
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="supervisor"
              label="Giảng viên hướng dẫn"
              rules={[{ required: true, message: 'Vui lòng chọn GVHD!' }]}
            >
              <Select
                showSearch
                placeholder="Chọn GVHD"
                optionFilterProp="children"
              >
                <Select.Option value="supervisor1">Giảng viên 1</Select.Option>
                <Select.Option value="supervisor2">Giảng viên 2</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="supervisorRubric"
              label="Phiếu đánh giá GVHD"
              rules={[{ required: true, message: 'Vui lòng chọn phiếu đánh giá!' }]}
            >
              <Select placeholder="Chọn phiếu đánh giá">
                <Select.Option value="rubric1">Phiếu đánh giá GVHD 1</Select.Option>
                <Select.Option value="rubric2">Phiếu đánh giá GVHD 2</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reviewer"
              label="Giảng viên phản biện"
              rules={[{ required: true, message: 'Vui lòng chọn GVPB!' }]}
            >
              <Select
                showSearch
                placeholder="Chọn GVPB"
                optionFilterProp="children"
              >
                <Select.Option value="reviewer1">Giảng viên 3</Select.Option>
                <Select.Option value="reviewer2">Giảng viên 4</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reviewerRubric"
              label="Phiếu đánh giá GVPB"
              rules={[{ required: true, message: 'Vui lòng chọn phiếu đánh giá!' }]}
            >
              <Select placeholder="Chọn phiếu đánh giá">
                <Select.Option value="rubric3">Phiếu đánh giá GVPB 1</Select.Option>
                <Select.Option value="rubric4">Phiếu đánh giá GVPB 2</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="committee"
              label="Hội đồng"
              rules={[{ required: true, message: 'Vui lòng chọn hội đồng!' }]}
            >
              <Select
                showSearch
                placeholder="Chọn hội đồng"
                optionFilterProp="children"
              >
                <Select.Option value="committee1">Hội đồng 1</Select.Option>
                <Select.Option value="committee2">Hội đồng 2</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="committeeRubric"
              label="Phiếu đánh giá hội đồng"
              rules={[{ required: true, message: 'Vui lòng chọn phiếu đánh giá!' }]}
            >
              <Select placeholder="Chọn phiếu đánh giá">
                <Select.Option value="rubric5">Phiếu đánh giá hội đồng 1</Select.Option>
                <Select.Option value="rubric6">Phiếu đánh giá hội đồng 2</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Evaluation; 