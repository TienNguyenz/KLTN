import React from 'react';
import { FaFacebookF } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

const LienHePage = () => {
  return (
    <div className="bg-[#008bc3] py-5 mb-5 min-h-screen">
      <div className="container mx-auto py-5 text-center">
        <h1 className="text-4xl text-white font-bold mb-2">Liên Hệ</h1>
        <nav className="text-white mt-2">
          <a href="/" className="hover:underline">Trang chủ</a> / <span>Liên Hệ</span>
        </nav>
      </div>

      <div className="container mx-auto py-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <h5 className="text-xl font-semibold mb-2 text-[#008bc3]">Thông tin liên hệ SGU</h5>
          <div className="text-gray-700 mb-4">
            <p><strong>Địa chỉ:</strong> 273 An Dương Vương, Phường 3, Quận 5, TP.HCM</p>
            <p><strong>Điện thoại:</strong> (028) 38 354 409</p>
            <p><strong>Email:</strong> sgu@sgu.edu.vn</p>
            <p><strong>Website:</strong> <a href="https://sgu.edu.vn" className="text-[#008bc3] hover:underline">https://sgu.edu.vn</a></p>
          </div>
          <div className="flex gap-3 mt-4">
            <a href="https://www.facebook.com/TruongDaihocSaiGon.SGU" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-[#008bc3] rounded-full text-white hover:bg-[#0073a8] transition-colors">
              <FaFacebookF size={20} />
            </a>
            <a href="https://www.tiktok.com/@daihocsaigon" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-[#008bc3] rounded-full text-white hover:bg-[#0073a8] transition-colors">
              <SiTiktok size={22} />
            </a>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-full min-h-[300px]"
            src="https://www.google.com/maps?q=Trường+Đại+học+Sài+Gòn,+273+An+Dương+Vương,+Phường+3,+Quận+5,+TP.HCM&hl=vi&z=16&output=embed"
            frameBorder="0"
            style={{ border: '0' }}
            allowFullScreen=""
            aria-hidden="false"
            tabIndex="0"
            title="Bản đồ SGU"
          ></iframe>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <form className="space-y-4">
            <input type="text" placeholder="Họ tên" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#008bc3]" />
            <input type="email" placeholder="Email" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#008bc3]" />
            <input type="text" placeholder="SĐT" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#008bc3]" />
            <textarea placeholder="Nội dung" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#008bc3]" rows="5"></textarea>
            <button type="submit" className="w-full bg-[#008bc3] text-white py-2 rounded-lg font-semibold hover:bg-[#0073a8] transition-all duration-300 shadow">
              Gửi nội dung
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LienHePage;