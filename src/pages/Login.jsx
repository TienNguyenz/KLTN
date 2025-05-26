import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginBackground from '../images/login_background.jpg';
import { Modal, message, Steps } from 'antd';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', data.token);
      
      // Lưu thông tin user và token vào context
      login({ ...data.user, token: data.token });

      // Chuyển hướng dựa vào role
      let targetPath = from;
      if (data.user.role === 'sinhvien') {
        targetPath = '/student';
      } else if (data.user.role === 'giaovu') {
        targetPath = '/HomeRoleManage';
      } else if (data.user.role === 'giangvien') {
        targetPath = '/lecturer';
      }

      navigate(targetPath, { replace: true });
    } catch (error) {
      setError(error.message || 'Đăng nhập thất bại');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      alert('Vui lòng nhập email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        // Nếu không phải JSON, data sẽ là {}
      }

      if (!response.ok) {
        alert(data.message || `Lỗi ${response.status}: ${response.statusText}`);
        setIsLoading(false);
        return;
      }

      // Thành công mới chuyển bước
      alert('Mã xác nhận đã được gửi đến email của bạn');
      setCurrentStep(1);
    } catch (error) {
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      alert('Vui lòng nhập mã xác nhận');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: forgotPasswordEmail,
          code: verificationCode 
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {}

      if (!response.ok) {
        alert(data.message || `Lỗi ${response.status}: ${response.statusText}`);
        setIsLoading(false);
        return;
      }

      alert('Xác thực thành công');
      setCurrentStep(2);
    } catch (error) {
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: forgotPasswordEmail,
          newPassword: newPassword 
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {}

      if (!response.ok) {
        alert(data.reason || data.message || `Lỗi ${response.status}: ${response.statusText}`);
        setIsLoading(false);
        return;
      }

      if (data.success) {
        alert(data.message + (data.details ? ('\n' + data.details) : ''));
        setIsForgotPasswordModalVisible(false);
        resetForgotPasswordForm();
      } else {
        alert(data.reason || data.message || 'Đặt lại mật khẩu thất bại');
      }
    } catch (error) {
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotPasswordForm = () => {
    setForgotPasswordEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentStep(0);
  };

  const steps = [
    {
      title: 'Nhập Email',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Vui lòng nhập email của bạn. Chúng tôi sẽ gửi mã xác nhận đến email này.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#008bc3] focus:ring-[#008bc3]"
              placeholder="Nhập email của bạn"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Xác thực',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Vui lòng nhập mã xác nhận đã được gửi đến email của bạn.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã xác nhận</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#008bc3] focus:ring-[#008bc3]"
              placeholder="Nhập mã xác nhận"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Đặt lại mật khẩu',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Vui lòng nhập mật khẩu mới của bạn.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#008bc3] focus:ring-[#008bc3]"
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#008bc3] focus:ring-[#008bc3]"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
        </div>
      ),
    },
  ];

  const handleModalOk = () => {
    switch (currentStep) {
      case 0:
        handleForgotPassword();
        break;
      case 1:
        handleVerifyCode();
        break;
      case 2:
        handleResetPassword();
        break;
      default:
        break;
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen relative"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* Login form container */}
      <div className="relative z-10 bg-white p-8 md:p-10 rounded-xl shadow-xl w-full max-w-md mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Đăng Nhập Hệ Thống</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-6 text-center text-sm">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#008bc3] focus:border-transparent placeholder-gray-400"
              id="email"
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Mật khẩu
            </label>
            <input
              className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#008bc3] focus:border-transparent placeholder-gray-400"
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsForgotPasswordModalVisible(true)}
              className="text-sm text-[#008bc3] hover:text-[#0073a8]"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div>
            <button
              className="w-full bg-[#008bc3] hover:bg-[#0073a8] text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300 shadow-md"
              type="submit"
            >
              Đăng Nhập
            </button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        title="Quên Mật Khẩu"
        open={isForgotPasswordModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsForgotPasswordModalVisible(false);
          resetForgotPasswordForm();
        }}
        okText={currentStep === 2 ? "Đặt lại mật khẩu" : "Tiếp tục"}
        cancelText="Hủy"
        confirmLoading={isLoading}
        width={600}
        maskClosable={false}
        closable={!isLoading}
      >
        <Steps
          current={currentStep}
          items={steps.map(item => ({ title: item.title }))}
          className="mb-8"
        />
        {steps[currentStep].content}
      </Modal>
    </div>
  );
}
