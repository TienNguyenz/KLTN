import React from 'react';

const ThongBaoPage = () => {
  return (
    <div className="bg-[#06BBCC] py-5 mb-5">
      <div className="container mx-auto py-5 text-center">
        <h1 className="text-4xl text-white font-bold">Thông Báo</h1>
        <nav className="text-white mt-2">
          <a href="/" className="hover:underline">Trang chủ</a> / <span>Thông Báo</span>
        </nav>
      </div>

      <div className="container mx-auto py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[{
          title: 'Lịch nghỉ tết 2025',
          date: '20/12/2024',
          desc: 'Trường sẽ nghỉ tết từ ngày 10/02/2025 đến 20/02/2025...'
        }, {
          title: 'Thông báo tuyển sinh 2025',
          date: '15/01/2025',
          desc: 'Trường bắt đầu nhận hồ sơ tuyển sinh từ ngày 01/03/2025...'
        }, {
          title: 'Hội thảo khoa học',
          date: '05/03/2025',
          desc: 'Hội thảo khoa học về công nghệ AI sẽ diễn ra vào ngày 20/03/2025...'
        }].map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl shadow-lg">
            <h5 className="text-2xl font-semibold text-[#06BBCC]">{item.title}</h5>
            <p className="text-gray-500 text-sm">{item.date}</p>
            <p className="mt-2">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThongBaoPage;