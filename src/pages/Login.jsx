import { useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

import { FaUser, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import Background from "../images/login_background.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Logging in with:", { email, password });
    // Handle authentication logic here
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${Background})`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-[28rem] p-8 rounded-2xl shadow-2xl bg-white bg-opacity-90">
          <CardContent>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
              Đăng Nhập
            </h2>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm font-medium mb-2">
                Gmail sinh viên
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:border-blue-500">
                <FaUser className="text-gray-400 mr-2" />
                <Input
                  type="email"
                  placeholder="Nhập email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Mật khẩu
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                <FaLock className="text-gray-400 mr-2" />
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0"
                />
              </div>
            </div>
            <Button
              className="w-full bg-blue-500 text-white py-2 rounded-lg mt-2 hover:bg-blue-600 transition"
              onClick={handleLogin}
            >
              Đăng Nhập
            </Button>
            <p className="text-center text-sm text-gray-500 mt-4">
              Chưa có tài khoản?{" "}
              <a href="#" className="text-blue-500">
                Đăng ký
              </a>
            </p>
          </CardContent>
        </div>
      </motion.div>
    </div>
  );
}
