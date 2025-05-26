import React from 'react';
import sliderImage from '../images/login_background.jpg';

const Homepage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[700px] bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${sliderImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h2 className="text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
              Chào Mừng Đến Với <br />
              <span className="text-[#008bc3]">Đại Học Sài Gòn (SGU)</span>
            </h2>
            <p className="text-xl mb-8 max-w-2xl drop-shadow">
              Nơi ươm mầm tri thức, chắp cánh ước mơ cho thế hệ trẻ Việt Nam. SGU - Đổi mới, sáng tạo, hội nhập quốc tế.
            </p>
            <div className="flex gap-4">
              <a href="/about" className="px-8 py-3 bg-[#008bc3] text-white rounded-full font-semibold hover:bg-[#0073a8] transition-all duration-300 shadow-lg">
                Tìm Hiểu SGU
              </a>
              <a href="/contact" className="px-8 py-3 bg-white text-[#008bc3] rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg">
                Liên Hệ Tuyển Sinh
              </a>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="py-20 bg-sky-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative order-first md:order-last">
                <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/images/sgu_about.jpg"
                    alt="Đại học Sài Gòn"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[#008bc3] rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Chất Lượng Đào Tạo</h4>
                      <p className="text-sm text-gray-600">Top 50 trường đại học hàng đầu Việt Nam</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-gray-800">
                  Giới Thiệu Về <span className="text-[#008bc3]">SGU</span>
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Trường Đại học Sài Gòn (SGU) là trường đại học công lập đa ngành, trực thuộc UBND TP.HCM, đào tạo nguồn nhân lực chất lượng cao, nghiên cứu khoa học, chuyển giao công nghệ phục vụ phát triển kinh tế - xã hội khu vực phía Nam và cả nước. SGU tự hào với truyền thống hơn 45 năm xây dựng và phát triển, là nơi hội tụ của hơn 20.000 sinh viên, 800 cán bộ giảng viên, 30 ngành đào tạo đại học, 7 ngành đào tạo sau đại học.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-3xl font-bold text-[#008bc3] mb-2">30+</h3>
                    <p className="text-gray-600">Ngành Đào Tạo</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-3xl font-bold text-[#008bc3] mb-2">20,000+</h3>
                    <p className="text-gray-600">Sinh Viên</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-3xl font-bold text-[#008bc3] mb-2">800+</h3>
                    <p className="text-gray-600">Giảng Viên</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-3xl font-bold text-[#008bc3] mb-2">100+</h3>
                    <p className="text-gray-600">Đối Tác Doanh Nghiệp</p>
                  </div>
                </div>
                <a href="/about" className="inline-block px-8 py-3 bg-[#008bc3] text-white rounded-full font-semibold hover:bg-[#0073a8] transition-all duration-300">
                  Tìm Hiểu Thêm
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Điểm Nổi Bật SGU</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-[#008bc3] rounded-full flex items-center justify-center mb-6">
                  <img src="src/images/SGU-LOGO.png" alt="Phương pháp học" className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Phương Pháp Học Hiện Đại</h3>
                <p className="text-gray-600">Áp dụng phương pháp học tập tiên tiến, kết hợp lý thuyết và thực hành, giúp sinh viên phát triển toàn diện.</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-[#008bc3] rounded-full flex items-center justify-center mb-6">
                  <img src="src/images/SGU-LOGO.png" alt="Cam kết việc làm" className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Cam Kết Việc Làm</h3>
                <p className="text-gray-600">Hợp tác với doanh nghiệp, đảm bảo cơ hội việc làm cho sinh viên sau tốt nghiệp.</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-[#008bc3] rounded-full flex items-center justify-center mb-6">
                  <img src="src/images/SGU-LOGO.png" alt="Môi trường học tập" className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Môi Trường Học Tập Lý Tưởng</h3>
                <p className="text-gray-600">Cơ sở vật chất hiện đại, không gian học tập sáng tạo, thân thiện, năng động.</p>
              </div>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Tin Tức SGU</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <img src="src/images/Hội nghị Nghiên cứu khoa học Trường Đại học Sài Gòn năm 2025.jpg" alt="SGU News 1" className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h4 className="text-2xl font-bold mb-3">
                    SGU tổ chức hội thảo quốc tế về chuyển đổi số trong giáo dục
                  </h4>
                  <p className="text-gray-500 mb-4">15/04/2024, TP.HCM</p>
                  <p className="text-gray-600 mb-4">
                    Hội thảo quy tụ các chuyên gia, nhà khoa học trong và ngoài nước, chia sẻ kinh nghiệm chuyển đổi số trong giáo dục đại học.
                  </p>
                  <a href="/news" className="text-[#008bc3] font-semibold hover:text-[#0073a8] transition-colors">
                    Đọc Ngay →
                  </a>
                </div>
              </article>

              <article className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <img src="src/images/Lễ khai mạc Kỳ thi Olympic Toán học Sinh viên và Học sinh Lần thứ 31 – năm 2025.jpg" alt="SGU News 2" className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h4 className="text-2xl font-bold mb-3">
                    Sinh viên SGU đạt giải thưởng Olympic Tin học toàn quốc
                  </h4>
                  <p className="text-gray-500 mb-4">10/03/2024, TP.HCM</p>
                  <p className="text-gray-600 mb-4">
                    Đội tuyển sinh viên SGU xuất sắc giành nhiều giải thưởng tại Olympic Tin học sinh viên toàn quốc lần thứ 31.
                  </p>
                  <a href="/news" className="text-[#008bc3] font-semibold hover:text-[#0073a8] transition-colors">
                    Đọc Ngay →
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Sự Kiện Sắp Tới</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#008bc3] text-white p-4 rounded-lg text-center mr-4">
                      <p className="text-lg font-semibold">Tháng 7</p>
                      <p className="text-4xl font-bold">20</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Ngày hội việc làm SGU 2025</h3>
                      <p className="text-gray-500">08:00 - 16:00</p>
                    </div>
                  </div>
                  <a href="/notifications" className="text-[#008bc3] font-semibold hover:text-[#0073a8] transition-colors">
                    Xem Chi Tiết →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">Liên Hệ Với SGU</h3>
              <p className="text-gray-600 mb-6">
                Mọi thắc mắc về tuyển sinh, chương trình đào tạo, vui lòng liên hệ với chúng tôi qua email: <b>sgu@sgu.edu.vn</b> hoặc số điện thoại <b>(028) 38 354 409</b>.
              </p>
              <a href="/contact" className="inline-block px-8 py-3 bg-[#008bc3] text-white rounded-full font-semibold hover:bg-[#0073a8] transition-all duration-300">
                Liên Hệ Ngay
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Homepage;
