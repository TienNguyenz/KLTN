import React from 'react';
import { Card, Row, Col, Table, Button, Input, Select } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const Dashboard = () => {
  const columns = [
    {
      title: 'Tên đề tài',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'GVHD',
      dataIndex: 'supervisor',
      key: 'supervisor',
      width: '15%',
    },
    {
      title: 'Chuyên ngành',
      dataIndex: 'major',
      key: 'major',
      width: '15%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-800' :
          status === 'Đã duyệt' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <div className="space-x-2">
          <Button type="link" size="small">Chi tiết</Button>
          <Button type="link" size="small">Duyệt</Button>
          <Button type="link" danger size="small">Từ chối</Button>
        </div>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      name: 'Nghiên cứu ứng dụng AI trong y tế',
      supervisor: 'Nguyễn Văn A',
      major: 'CNTT',
      status: 'Chờ duyệt',
    },
    {
      key: '2',
      name: 'Phát triển ứng dụng web với React',
      supervisor: 'Trần Thị B',
      major: 'KTPM',
      status: 'Đã duyệt',
    },
    // Thêm dữ liệu mẫu...
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản Lý Đề Tài</h1>

      <div className="mb-6">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card bordered={false} className="shadow-sm">
              <div className="text-gray-500 mb-1">Tổng số đề tài</div>
              <div className="text-2xl font-semibold">150</div>
              <div className="text-sm text-green-500 mt-2">+12% so với kỳ trước</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} className="shadow-sm">
              <div className="text-gray-500 mb-1">Đề tài chờ duyệt</div>
              <div className="text-2xl font-semibold">25</div>
              <div className="text-sm text-yellow-500 mt-2">5 đề tài mới</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} className="shadow-sm">
              <div className="text-gray-500 mb-1">Đề tài đã duyệt</div>
              <div className="text-2xl font-semibold">89</div>
              <div className="text-sm text-green-500 mt-2">Hoàn thành 75%</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} className="shadow-sm">
              <div className="text-gray-500 mb-1">Đề tài từ chối</div>
              <div className="text-2xl font-semibold">12</div>
              <div className="text-sm text-red-500 mt-2">-2% so với kỳ trước</div>
            </Card>
          </Col>
        </Row>
      </div>

      <Card bordered={false} className="shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <Input
              placeholder="Tìm kiếm đề tài..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
            />
            <Select defaultValue="all" style={{ width: 180 }}>
              <Option value="all">Tất cả chuyên ngành</Option>
              <Option value="cntt">Công nghệ thông tin</Option>
              <Option value="ktpm">Kỹ thuật phần mềm</Option>
            </Select>
          </div>
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm đề tài
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            total: data.length,
            pageSize: 10,
            showTotal: (total) => `Tổng số ${total} đề tài`,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
};

export default Dashboard; 