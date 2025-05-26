import { Link } from "react-router-dom";
import img1 from '../images/VIỆN NGHIÊN CỨU KINH TẾ XÃ HỘI, TRƯỜNG ĐẠI HỌC SÀI GÒN (RISE) LÀM VIỆC CÙNG PHÁI ĐOÀN VIỆN KONRAD-ADENAUER-STIFTUNG VIỆT NAM (KAS).jpg';
import img2 from '../images/Hội nghị Nghiên cứu khoa học Trường Đại học Sài Gòn năm 2025.jpg';
import img3 from '../images/Trường Đại học Sài Gòn vinh dự được xếp hạng Di tích kiến trúc nghệ thuật.jpg';
import img4 from '../images/Lễ khai mạc Kỳ thi Olympic Toán học Sinh viên và Học sinh Lần thứ 31 – năm 2025.jpg';
import img5 from '../images/Bế mạc trao giải hội thao truyền thống sinh viên Đại học Sài Gòn năm học 2024 – 2025 (giai đoạn 2).jpg';
import img6 from '../images/Trường Đại học Sài Gòn ký kết thỏa thuận hợp tác với Khách sạn Bến Thành (Rex).jpg';

export default function News() {
  const articles = [
    {
      id: 1,
      title: "Viện Nghiên cứu Kinh tế Xã hội, Trường Đại học Sài Gòn (RISE) làm việc cùng phái đoàn Konrad-Adenauer-Stiftung Việt Nam (KAS)",
      date: "24/05/2025",
      description: "Sáng ngày 16/5/2025, Viện Nghiên cứu Kinh tế Xã hội, Trường Đại học Sài Gòn (RISE) đã có buổi làm việc quan trọng với phái đoàn Viện Konrad-Adenauer-Stiftung Việt Nam (KAS).",
      image: img1,
      link: "/news/rise-kas-2025"
    },
    {
      id: 2,
      title: "Hội nghị Nghiên cứu khoa học Trường Đại học Sài Gòn năm 2025",
      date: "22/05/2025",
      description: "Trường Đại học Sài Gòn long trọng tổ chức Hội nghị Nghiên cứu khoa học năm 2025 nhằm tổng kết hoạt động khoa học và công nghệ của Nhà trường và triển khai phương hướng trong thời gian tới.",
      image: img2,
      link: "/news/hoi-nghi-nghien-cuu-2025"
    },
    {
      id: 3,
      title: 'Trường Đại học Sài Gòn vinh dự được xếp hạng "Di tích kiến trúc nghệ thuật" cấp Thành phố',
      date: "02/04/2025",
      description: "Ngày 30/3/2025, Trường Đại học Sài Gòn được Sở VH&TT TPHCM công nhận là Di tích kiến trúc nghệ thuật cấp Thành phố.",
      image: img3,
      link: "/news/di-tich-kien-truc"
    },
    {
      id: 4,
      title: "Lễ khai mạc Kỳ thi Olympic Toán học Sinh viên và Học sinh Lần thứ 31 – năm 2025",
      date: "01/04/2025",
      description: "Trường Đại học Sài Gòn phối hợp Hội Toán học Việt Nam tổ chức Lễ khai mạc Kỳ thi Olympic Toán học Sinh viên – Học sinh Lần thứ 31.",
      image: img4,
      link: "/news/olympic-toan-hoc-2025"
    },
    {
      id: 5,
      title: "Bế mạc trao giải hội thao truyền thống sinh viên Đại học Sài Gòn năm học 2024 – 2025 (giai đoạn 2)",
      date: "25/03/2025",
      description: "Bế mạc trao giải hội thao truyền thống sinh viên Đại học Sài Gòn năm học 2024 – 2025 (giai đoạn 2), chào mừng Đại hội Đảng bộ Trường lần thứ XVI.",
      image: img5,
      link: "/news/hoi-thao-truyen-thong-2025"
    },
    {
      id: 6,
      title: "Trường Đại học Sài Gòn ký kết thỏa thuận hợp tác với Khách sạn Bến Thành (Rex)",
      date: "18/03/2025",
      description: "Tháng 10/2023, Trường Đại học Sài Gòn ký kết thỏa thuận hợp tác toàn diện với Tổng Công ty Du lịch Sài Gòn TNHH Một thành viên (Saigontourist Group) giai đoạn 2023 - 2028.",
      image: img6,
      link: "/news/hop-tac-rex-2025"
    },
  ];

  return (
    <>
      <div className="bg-[#008bc3] py-6 mb-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">Tin Tức – Sự Kiện</h1>
            <nav aria-label="breadcrumb">
              <ol className="flex justify-center space-x-2">
                <li><Link to="/" className="hover:underline">Trang chủ</Link></li>
                <li><span aria-hidden="true">/</span></li>
                <li aria-current="page">Tin Tức</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center md:text-left text-[#008bc3]">Tin Tức Mới Nhất Từ SGU</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article 
              key={article.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <Link to={article.link} className="block group">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-56 object-cover group-hover:opacity-90 transition-opacity duration-300"
                />
              </Link>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-3">
                  <Link to={article.link} className="text-gray-800 hover:text-[#008bc3] transition-colors">
                    {article.title}
                  </Link>
                </h3>
                <p className="text-gray-500 text-sm mb-4">{article.date}</p>
                <p className="text-gray-600 mb-5 flex-grow">{article.description}</p>
                <div className="mt-auto">
                  <Link 
                    to={article.link} 
                    className="inline-flex items-center px-5 py-2 bg-[#008bc3] text-white rounded-full font-semibold shadow hover:bg-[#0073a8] transition-colors"
                  >
                    Đọc Tiếp <i className="fas fa-arrow-right ml-2"></i>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <button className="bg-[#008bc3] text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-[#0073a8] transition-colors">
            Xem Thêm Tin Tức
          </button>
        </div>
      </div>
    </>
  );
}
  