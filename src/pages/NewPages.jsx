import React from 'react';

export default function NewsPage() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-blue-500 py-10 mb-10">
        <div className="container mx-auto text-center text-white">
          <h1 className="text-5xl font-bold">Tin Tức</h1>
          <nav className="mt-4">
            <ul className="flex justify-center space-x-4">
              <li><a href="/" className="hover:underline">Trang chủ</a></li>
              <li className="text-gray-300">/</li>
              <li>Giới Thiệu</li>
            </ul>
          </nav>
        </div>
      </div>

      <section className="bg-gray-200 py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6">Tin Tức Gần Nhất</h2>

          <div className="space-y-8">
            <article className="bg-white p-6 rounded-lg shadow-md flex space-x-4">
              <img src="/Theme/images/tt1.jpg" alt="" className="w-1/4 rounded-lg" />
              <div>
                <h4 className="text-xl font-bold">\u0110/c Nguyễn Thị Thương trúng cử BCH \u0110oàn TNCS Hồ Chí Minh tỉnh Bình Dương khóa XI</h4>
                <p className="text-gray-500 text-sm">05/10/2022, Bình Dương</p>
                <p>Diễn ra trong 2 ngày (3-4/10/2022) tại Trung tâm Hội nghị và Triễn lãm tỉnh Bình Dương...</p>
                <a href="#" className="text-blue-500 font-medium">\u0110ọc Ngay</a>
              </div>
            </article>

            <article className="bg-white p-6 rounded-lg shadow-md flex space-x-4">
              <img src="/Theme/images/tt2.jpg" alt="" className="w-1/4 rounded-lg" />
              <div>
                <h4 className="text-xl font-bold">SV ngành Kỹ thuật môi trường học tập thực tế tại các tỉnh miền Tây</h4>
                <p className="text-gray-500 text-sm">05/10/2022, Bình Dương</p>
                <p>Từ ngày 26/09 – 30/09/2022, sinh viên năm 3 và năm 4 ngành Kỹ thuật môi trường...</p>
                <a href="#" className="text-blue-500 font-medium">\u0110ọc Ngay</a>
              </div>
            </article>

            <div className="text-center mt-8">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Hiển Thị Thêm</button>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white h-12"></div>
    </div>
  );
}
