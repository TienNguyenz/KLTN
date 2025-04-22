import React, { useState } from 'react';
import { Form, Input, Select, Button, Card } from 'antd';

const EditUserForm = ({ user, userType, onSave, onCancel }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    onSave(values);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Thông tin tài khoản</h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={user}
        onFinish={onFinish}
      >
        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mã số"
          name="id"
          rules={[{ required: true, message: 'Vui lòng nhập mã số' }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="CCCD"
          name="cccd"
          rules={[{ required: true, message: 'Vui lòng nhập CCCD' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Địa chỉ liên hệ"
          name="address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="currentAddress"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ hiện tại' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Ngày sinh"
          name="birthDate"
          rules={[{ required: true, message: 'Vui lòng nhập ngày sinh' }]}
        >
          <Input type="date" />
        </Form.Item>

        <Form.Item
          label="Khoa"
          name="faculty"
          rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
        >
          <Select>
            <Select.Option value="cntt">Công nghệ thông tin</Select.Option>
            <Select.Option value="ktpm">Kỹ thuật phần mềm</Select.Option>
            <Select.Option value="httt">Hệ thống thông tin</Select.Option>
            <Select.Option value="khmt">Khoa học máy tính</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Chuyên ngành"
          name="major"
          rules={[{ required: true, message: 'Vui lòng chọn chuyên ngành' }]}
        >
          <Select>
            <Select.Option value="cntt">Công nghệ thông tin</Select.Option>
            <Select.Option value="ktpm">Kỹ thuật phần mềm</Select.Option>
            <Select.Option value="httt">Hệ thống thông tin</Select.Option>
            <Select.Option value="khmt">Khoa học máy tính</Select.Option>
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-4 mt-6">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default EditUserForm; 