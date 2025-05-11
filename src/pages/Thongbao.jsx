import React from 'react';

const ThongBaoPage = () => {
  const notifications = [
    {
      title: 'Lịch nghỉ lễ 30/4 & 1/5 năm 2024',
      date: '15/04/2024',
      desc: 'Trường Đại học Sài Gòn thông báo lịch nghỉ lễ 30/4 & 1/5 cho toàn thể sinh viên, giảng viên từ 27/04 đến hết 01/05/2024.'
    },
    {
      title: 'Thông báo tuyển sinh đại học chính quy 2024',
      date: '01/03/2024',
      desc: 'SGU bắt đầu nhận hồ sơ tuyển sinh đại học chính quy năm 2024 từ ngày 10/03/2024. Xem chi tiết tại website tuyển sinh.'
    },
    {
      title: 'Học bổng khuyến khích học tập học kỳ 2 năm học 2023-2024',
      date: '20/02/2024',
      desc: 'Sinh viên có thành tích học tập xuất sắc sẽ được xét cấp học bổng khuyến khích học tập. Xem danh sách và điều kiện tại phòng CTSV.'
    },
    {
      title: 'Hội thảo khoa học "Chuyển đổi số trong giáo dục đại học"',
      date: '10/02/2024',
      desc: 'Kính mời giảng viên, sinh viên đăng ký tham dự hội thảo khoa học về chuyển đổi số trong giáo dục đại học tổ chức tại SGU ngày 25/03/2024.'
    },
  ];

  return (
    <div className="bg-[#008bc3] py-5 mb-5 min-h-screen">
      <div className="container mx-auto py-5 text-center">
        <h1 className="text-4xl text-white font-bold mb-2">Thông Báo</h1>
        <nav className="text-white mt-2">
          <a href="/" className="hover:underline">Trang chủ</a> / <span>Thông Báo</span>
        </nav>
      </div>

      <div className="container mx-auto py-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notifications.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-lg flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
            <h5 className="text-2xl font-semibold text-[#008bc3] mb-2">{item.title}</h5>
            <p className="text-gray-500 text-sm mb-2">{item.date}</p>
            <p className="mb-4 text-gray-700 flex-grow">{item.desc}</p>
            <button className="mt-auto px-5 py-2 bg-[#008bc3] text-white rounded-full font-semibold hover:bg-[#0073a8] transition-all duration-300 shadow">
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThongBaoPage;