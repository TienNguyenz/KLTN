import React from 'react';
import sliderImage from '../images/login_background.jpg';

const TrangChu = () => {
  return (
    <div className="flex flex-col min-h-screen mt-32">
      <div className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[700px] bg-cover bg-center overflow-hidden" 
            style={{ backgroundImage: `url(${sliderImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h2 className="text-7xl font-bold mb-6 leading-tight">
              Chào Mừng Đến Với <br />
              <span className="text-[#008bc3]">Đại Học TDMU</span>
            </h2>
            <p className="text-xl mb-8 max-w-2xl">
              Nơi ươm mầm tri thức, chắp cánh ước mơ cho thế hệ trẻ Việt Nam
            </p>
            <div className="flex gap-4">
              <a href="#" className="px-8 py-3 bg-[#008bc3] text-white rounded-full font-semibold hover:bg-[#0073a8] transition-all duration-300 shadow-lg">
                Khám Phá Ngay
              </a>
              <a href="#" className="px-8 py-3 bg-white text-[#008bc3] rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg">
                Tìm Hiểu Thêm
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
                    src="/Theme/images/about.jpg" 
                    alt="Đại học TDMU" 
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
                      <p className="text-sm text-gray-600">Top 100 trường đại học hàng đầu Việt Nam</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-gray-800">
                  Giới Thiệu Về <span className="text-[#008bc3]">Đại Học TDMU</span>
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Đại học Thủ Dầu Một (TDMU) là một trong những trường đại học công lập hàng đầu tại tỉnh Bình Dương, 
                  với sứ mệnh đào tạo nguồn nhân lực chất lượng cao, nghiên cứu khoa học và chuyển giao công nghệ 
                  phục vụ sự phát triển kinh tế - xã hội của địa phương và cả nước.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-3xl font-bold text-[#008bc3] mb-2">20+</h3>
                    <p className="text-gray-600">Ngành Đào Tạo</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-3xl font-bold text-[#008bc3] mb-2">15K+</h3>
                    <p className="text-gray-600">Sinh Viên</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-3xl font-bold text-[#008bc3] mb-2">500+</h3>
                    <p className="text-gray-600">Giảng Viên</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-3xl font-bold text-[#008bc3] mb-2">50+</h3>
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
            <h2 className="text-4xl font-bold text-center mb-12">Tại Sao Chọn TDMU?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-[#008bc3] rounded-full flex items-center justify-center mb-6">
                  <img src="/Theme/images/2.png" alt="Phương pháp học" className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Phương Pháp Học Hiện Đại</h3>
                <p className="text-gray-600">Áp dụng phương pháp học tập tiên tiến, kết hợp lý thuyết và thực hành, giúp sinh viên phát triển toàn diện.</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-[#008bc3] rounded-full flex items-center justify-center mb-6">
                  <img src="/Theme/images/3.png" alt="Cam kết việc làm" className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Cam Kết Việc Làm</h3>
                <p className="text-gray-600">Hợp tác chặt chẽ với các doanh nghiệp hàng đầu, đảm bảo cơ hội việc làm cho sinh viên sau khi tốt nghiệp.</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-[#008bc3] rounded-full flex items-center justify-center mb-6">
                  <img src="/Theme/images/4.png" alt="Môi trường học tập" className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Môi Trường Học Tập Lý Tưởng</h3>
                <p className="text-gray-600">Cơ sở vật chất hiện đại, không gian học tập thoáng mát, tạo điều kiện tốt nhất cho sinh viên phát triển.</p>
              </div>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Tin Tức Mới Nhất</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <img src="/Theme/images/tt1.jpg" alt="" className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h4 className="text-2xl font-bold mb-3">
              Đ/c Nguyễn Thị Thương trúng cử BCH Đoàn TNCS Hồ Chí Minh tỉnh Bình Dương khóa XI
            </h4>
                  <p className="text-gray-500 mb-4">05/10/2022, Bình Dương</p>
                  <p className="text-gray-600 mb-4">
                    Diễn ra trong 2 ngày (3-4/10/2022) tại Trung tâm Hội nghị và Triển lãm tỉnh Bình Dương...
                  </p>
                  <a href="#" className="text-[#008bc3] font-semibold hover:text-[#0073a8] transition-colors">
                    Đọc Ngay →
                  </a>
                </div>
          </article>

              <article className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <img src="/Theme/images/tt2.jpg" alt="" className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h4 className="text-2xl font-bold mb-3">
              SV ngành Kỹ thuật môi trường học tập thực tế tại các tỉnh miền Tây
            </h4>
                  <p className="text-gray-500 mb-4">05/10/2022, Bình Dương</p>
                  <p className="text-gray-600 mb-4">
                    Từ ngày 26/09 – 30/09/2022, sinh viên năm 3 và năm 4 ngành Kỹ thuật môi trường...
                  </p>
                  <a href="#" className="text-[#008bc3] font-semibold hover:text-[#0073a8] transition-colors">
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
              <p className="text-lg font-semibold">Tháng 4</p>
              <p className="text-4xl font-bold">15</p>
            </div>
            <div>
                      <h3 className="text-xl font-bold">Lễ khai giảng năm học 2022 – 2023</h3>
                      <p className="text-gray-500">08:00 - 11:00</p>
                    </div>
                  </div>
                  <a href="#" className="text-[#008bc3] font-semibold hover:text-[#0073a8] transition-colors">
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
              <h3 className="text-3xl font-bold mb-4">Liên Hệ Với Chúng Tôi</h3>
              <p className="text-gray-600 mb-6">
                Mọi thắc mắc về tuyển sinh, chương trình đào tạo, vui lòng liên hệ với chúng tôi
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

export default TrangChu;
