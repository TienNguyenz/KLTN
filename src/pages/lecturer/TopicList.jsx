import React, { useState } from 'react';
import { Table, Button, Modal, Space, Input, Select, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTopics } from '../../data/mockThesisData';

const { TextArea } = Input;
const { Option } = Select;

const TopicList = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    major: '',
    type: '',
    description: ''
  });

  const showTopicDetail = (topic) => {
    setSelectedTopic(topic);
    setIsViewModalVisible(true);
  };

  const showEditModal = (topic) => {
    setSelectedTopic(topic);
    setEditForm({
      name: topic.name,
      major: topic.major,
      type: topic.type,
      description: topic.description
    });
    setIsEditModalVisible(true);
  };

  const handleClose = () => {
    setIsViewModalVisible(false);
    setIsEditModalVisible(false);
    setSelectedTopic(null);
    setEditForm({
      name: '',
      major: '',
      type: '',
      description: ''
    });
  };

  const handleEditSubmit = () => {
    // TODO: Implement update logic here
    console.log('Updated topic:', editForm);
    handleClose();
  };

  // Kiểm tra xem đề tài có thể cập nhật/gửi đăng ký không
  const canUpdateOrSubmit = (topic) => {
    // Chỉ cho phép cập nhật và gửi đăng ký khi đề tài chưa được giáo vụ duyệt (chưa ready)
    // và chưa có sinh viên thực hiện
    return topic.status !== 'ready' && topic.status !== 'pending' && !(topic.selectedStudents?.length > 0);
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Tên đề tài',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại đề tài',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusText = {
          'ready': 'Đã duyệt',
          'pending': 'Đang chờ duyệt',
          'draft': 'Chưa gửi'
        };
        return statusText[status] || status;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showTopicDetail(record)}
          >
            Xem
          </Button>
          <Tooltip title={!canUpdateOrSubmit(record) ? "Không thể chỉnh sửa đề tài đã được duyệt, đang chờ duyệt hoặc đã có sinh viên thực hiện" : ""}>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              className="bg-blue-500"
              onClick={() => showEditModal(record)}
              disabled={!canUpdateOrSubmit(record)}
            >
              Sửa
            </Button>
          </Tooltip>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            disabled={!canUpdateOrSubmit(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách đề tài</h1>
        <Button type="primary" className="bg-blue-500">
          Thêm đề tài mới
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={getTopics()}
        rowKey="id"
      />

      {/* View Modal */}
      {selectedTopic && (
        <Modal
          title="Chi tiết đề tài"
          open={isViewModalVisible}
          onCancel={handleClose}
          width={800}
          footer={[
            <Button key="xoa" danger disabled={!canUpdateOrSubmit(selectedTopic)}>Xóa</Button>,
            <Tooltip key="guidangky" title={!canUpdateOrSubmit(selectedTopic) ? "Không thể gửi đăng ký đề tài đã được duyệt, đang chờ duyệt hoặc đã có sinh viên thực hiện" : ""}>
              <Button 
                type="primary" 
                className="bg-green-500" 
                disabled={!canUpdateOrSubmit(selectedTopic)}
              >
                Gửi đăng ký
              </Button>
            </Tooltip>,
            <Tooltip key="capnhat" title={!canUpdateOrSubmit(selectedTopic) ? "Không thể cập nhật đề tài đã được duyệt, đang chờ duyệt hoặc đã có sinh viên thực hiện" : ""}>
              <Button 
                type="primary" 
                className="bg-blue-500" 
                onClick={() => {
                  setIsViewModalVisible(false);
                  showEditModal(selectedTopic);
                }}
                disabled={!canUpdateOrSubmit(selectedTopic)}
              >
                Cập nhật đề tài
              </Button>
            </Tooltip>,
          ]}
        >
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Tên đề tài</div>
              <div className="text-base">{selectedTopic.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Chuyên ngành</div>
                <div className="text-base">{selectedTopic.major}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Loại đề tài</div>
                <div className="text-base">{selectedTopic.type}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Mô tả đề tài</div>
              <div className="text-base whitespace-pre-line border rounded-md p-4 bg-gray-50 min-h-[100px]">
                {selectedTopic.description || `1. Tính cấp thiết của đề tài
- Câu hỏi: Vì sao lại nghiên cứu đề tài đó?
+ Lí do khách quan: Ý nghĩa trên lý luận và thực tiễn chung
+ Lí do chủ quan: Thực trạng nơi tác giả nghiên cứu, nhu cầu, trách nhiệm, sự hứng thú của người nghiên cứu đối với vấn đề
- Các nghiên cứu đã được thực hiện trước đó từ đó chỉ ra điểm mới của đề tài, vấn đề mà nhóm lựa chọn.
- Trọng số trong bài nghiên cứu: Luận giải rõ ràng tính cấp thiết của vấn đề nghiên cứu: 10%`}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Sinh viên thực hiện</div>
              <div className="text-base">
                {selectedTopic.selectedStudents?.length > 0 ? (
                  <ul>
                    {selectedTopic.selectedStudents.map(student => (
                      <li key={student.id}>{student.name}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500">Chưa có sinh viên thực hiện</div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      <Modal
        title="Cập nhật đề tài"
        open={isEditModalVisible}
        onCancel={handleClose}
        width={800}
        footer={[
          <Button key="huy" onClick={handleClose}>
            Hủy
          </Button>,
          <Button key="luu" type="primary" className="bg-blue-500" onClick={handleEditSubmit}>
            Lưu
          </Button>,
        ]}
      >
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Tên đề tài</div>
            <Input
              value={editForm.name}
              onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên đề tài"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Chuyên ngành</div>
              <Select
                value={editForm.major}
                onChange={value => setEditForm(prev => ({ ...prev, major: value }))}
                className="w-full"
              >
                <Option value="CNTT">Công nghệ thông tin</Option>
                <Option value="CNPM">Công nghệ phần mềm</Option>
                <Option value="HTTT">Hệ thống thông tin</Option>
              </Select>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Loại đề tài</div>
              <Select
                value={editForm.type}
                onChange={value => setEditForm(prev => ({ ...prev, type: value }))}
                className="w-full"
              >
                <Option value="KLTN">Khóa luận tốt nghiệp</Option>
                <Option value="TTTN">Thực tập tốt nghiệp</Option>
                <Option value="NCKH">Nghiên cứu khoa học</Option>
              </Select>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Mô tả đề tài</div>
            <TextArea
              value={editForm.description}
              onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Nhập mô tả đề tài"
              rows={6}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TopicList; 