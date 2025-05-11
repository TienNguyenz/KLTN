import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-[#274374] text-white py-8">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Địa chỉ & Hotline */}
                <div className="space-y-4">
                    <h3 className="font-bold text-3xl">Địa Chỉ & Hotline</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center space-x-4">
                            <img src="/src/images/1167164.png" alt="Location" className="w-8 h-8 object-contain bg-transparent" />
                            <div className="space-y-2">
                                <p><strong>Cơ sở chính:</strong> 273 An Dương Vương – Phường 3 – Quận 5</p>
                                <p><strong>Cơ sở 1:</strong> 105 Bà Huyện Thanh Quan – Phường Võ Thị Sáu – Quận 3</p>
                                <p><strong>Cơ sở 2:</strong> 04 Tôn Đức Thắng – Phường Bến Nghé – Quận 1</p>
                                <p><strong>Ký túc xá:</strong> 99 An Dương Vương – Phường 16 – Quận 8</p>
                                <p><strong>Trường Trung học Thực hành Sài Gòn:</strong> 220 Trần Bình Trọng – Phường 4 – Quận 5</p>
                                <p><strong>Trường Tiểu học Thực hành Đại học Sài Gòn:</strong> 18 – 20 Ngô Thời Nhiệm – Phường Võ Thị Sáu – Quận 3</p>
                            </div>
                        </li>
                        <li className="flex items-center space-x-4">
                            <img src="/src/images/Communication-gmail-icon.png" alt="Email" className="w-8 h-8" />
                            <a href="mailto:sgu@sgu.edu.vn" className="hover:underline">
                            sgu@sgu.edu.vn
                            </a>
                        </li>
                        <li className="flex items-center space-x-4">
                            <img src="/src/images/6658756.png" alt="Phone" className="w-8 h-8" />
                            <span>
                            Điện thoại:
                            (028) 38 354 409 - 38 352 309
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Đảng - Đoàn Thể */}
                <div className="space-y-4">
                    <h3 className="font-bold text-3xl">Đảng - Đoàn Thể</h3>
                    <ul className="space-y-2">
                        <li>&#10148; Đảng ủy</li>
                        <li>&#10148; Công đoàn - Ban liên lạc cựu giáo chức</li>
                        <li>&#10148; Đoàn Thanh niên - Hội Sinh viên</li>
                        <li>&#10148; Công tác đoàn</li>
                    </ul>
                </div>

                {/* Mạng Xã Hội */}
                <div className="space-y-4">
                    <h3 className="font-bold text-3xl">Mạng Xã Hội</h3>
                    <p>Kết Nối Với Chúng Tôi</p>
                    <ul className="space-y-4">
                        <li className="flex items-center space-x-4">
                            <img src="/src/images/facebook.png" alt="Facebook" className="w-8 h-8" />
                            <span>Facebook</span>
                        </li>
                        <li className="flex items-center space-x-4">
                            <img src="/src/images/145804.png" alt="Google+" className="w-8 h-8" />
                            <span>Google+</span>
                        </li>
                        <li className="flex items-center space-x-4">
                            <img src="/src/images/124021.png" alt="Twitter" className="w-8 h-8" />
                            <span>Twitter</span>
                        </li>
                        <li className="flex items-center space-x-4">
                            <img src="/src/images/pinterest_icon.png" alt="Pinterest" className="w-8 h-8" />
                            <span>Pinterest</span>
                        </li>
                    </ul>
                </div>

                {/* Form Liên Hệ */}
                <div className="space-y-4">
                    <h3 className="font-bold text-3xl">Liên Hệ</h3>
                    <p>Để Lại Email Của Bạn</p>
                    <form action="#" className="flex flex-col space-y-2">
                        <input 
                            type="email" 
                            placeholder="Email address..." 
                            className="p-2 rounded focus:outline-none bg-[#1C3359] text-white" 
                        />
                        <button 
                            type="submit" 
                            className="bg-white text-[#274374] px-4 py-2 rounded hover:bg-gray-300"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Bản quyền */}
            <div className="text-center mt-8">
                <p>
                    &copy; {new Date().getFullYear()} SGU. Designed by SGU. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
