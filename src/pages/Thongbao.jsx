import React from 'react';

const ThongBaoPage = () => {
  const notifications = [
    {
      title: 'Trường Đại học Sài Gòn tổ chức bảo vệ luận án tiến sĩ cấp Cơ sở đào tạo cho Nghiên cứu sinh Nguyễn Minh Đảo',
      date: '23/05/2025',
      desc: 'Bảo vệ luận án tiến sĩ ngành Lịch sử Việt Nam, mã số 9229013, vào 08g00, thứ Năm, ngày 26/6/2025 tại Phòng B.101, Trường Đại học Sài Gòn.'
    },
    {
      title: 'Mở ngành đào tạo Lịch sử, Địa lý học',
      date: '19/05/2025',
      desc: 'Trường Đại học Sài Gòn thông báo mở ngành đào tạo mới: Lịch sử và Địa lý học.'
    },
    {
      title: 'Thông báo tuyển sinh đào tạo trình độ tiến sĩ khóa 12',
      date: '19/05/2025',
      desc: 'Thông báo tuyển sinh đào tạo trình độ tiến sĩ khóa 12 tại Trường Đại học Sài Gòn.'
    },
    {
      title: 'Thông báo tuyển sinh đào tạo trình độ thạc sĩ khóa 22',
      date: '19/05/2025',
      desc: 'Thông báo tuyển sinh đào tạo trình độ thạc sĩ khóa 22 tại Trường Đại học Sài Gòn.'
    },
    {
      title: 'Thông báo tuyển sinh lớp Bồi dưỡng Nghiệp vụ sư phạm dành cho người có bằng cử nhân chuyên ngành phù hợp có nguyện vọng trở thành giáo viên Tiểu học – Khóa 14 năm 2025',
      date: '16/05/2025',
      desc: 'Tuyển sinh lớp Bồi dưỡng Nghiệp vụ sư phạm dành cho người có bằng cử nhân chuyên ngành phù hợp có nguyện vọng trở thành giáo viên Tiểu học – Khóa 14 năm 2025.'
    },
    {
      title: 'Thông báo tuyển sinh lớp Bồi dưỡng Nghiệp vụ sư phạm dành cho người có bằng cử nhân chuyên ngành phù hợp có nguyện vọng trở thành giáo viên trung học cơ sở, trung học phổ thông – Khóa 14 năm 2025',
      date: '16/05/2025',
      desc: 'Tuyển sinh lớp Bồi dưỡng Nghiệp vụ sư phạm dành cho người có bằng cử nhân chuyên ngành phù hợp có nguyện vọng trở thành giáo viên THCS, THPT – Khóa 14 năm 2025.'
    },
    {
      title: 'Thông báo Tuyển sinh lớp Bồi dưỡng giáo viên dạy các môn Lịch sử và Địa lý, Khoa học tự nhiên, Tin học và Công nghệ năm 2025',
      date: '16/05/2025',
      desc: 'Tuyển sinh lớp Bồi dưỡng giáo viên dạy các môn Lịch sử và Địa lý, Khoa học tự nhiên, Tin học và Công nghệ năm 2025.'
    },
    {
      title: 'Thông báo tuyển sinh các lớp Bồi dưỡng theo tiêu chuẩn chức danh nghề nghiệp giáo viên trường mầm non, tiểu học, trung học cơ sở năm 2025',
      date: '16/05/2025',
      desc: 'Tuyển sinh các lớp Bồi dưỡng theo tiêu chuẩn chức danh nghề nghiệp giáo viên trường mầm non, tiểu học, trung học cơ sở năm 2025.'
    },
    {
      title: 'Thông báo về kết quả xét bổ nhiệm lần đầu và bổ nhiệm lại chức danh giáo sư, phó giáo sư năm 2025 của Trường Đại học Sài Gòn',
      date: '09/04/2025',
      desc: 'Kết quả xét bổ nhiệm lần đầu và bổ nhiệm lại chức danh giáo sư, phó giáo sư năm 2025.'
    },
    {
      title: 'Thông báo về việc tổ chức thi và cấp chứng chỉ tiếng Anh theo Khung năng lực ngoại ngữ 6 bậc dùng cho Việt Nam – Ngày thi 26, 27 tháng 04 năm 2025',
      date: '03/04/2025',
      desc: 'Tổ chức thi và cấp chứng chỉ tiếng Anh theo Khung năng lực ngoại ngữ 6 bậc dùng cho Việt Nam vào ngày 26, 27/04/2025.'
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