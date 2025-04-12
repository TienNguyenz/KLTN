import { Link } from "react-router-dom";

export default function GioiThieu() {
  return (
    <>
      <div className="bg-[#008bc3] py-6 mb-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">Giới Thiệu</h1>
            <nav aria-label="breadcrumb">
              <ol className="flex justify-center space-x-2">
                <li><Link to="/" className="hover:underline">Trang chủ</Link></li>
                <li><span aria-hidden="true">/</span></li>
                <li aria-current="page">Giới Thiệu</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">Về Đại Học Thủ Dầu Một</h2>
          <p className="text-gray-600 leading-relaxed">
            Đại học Thủ Dầu Một (TDMU) tự hào là một trong những cơ sở giáo dục đại học công lập uy tín tại Bình Dương, 
            cam kết đào tạo nguồn nhân lực chất lượng cao, đẩy mạnh nghiên cứu khoa học và chuyển giao công nghệ, 
            góp phần vào sự phát triển bền vững của khu vực và đất nước.
          </p>
          <h3 className="text-2xl font-semibold text-gray-700 pt-4">Những Điểm Nổi Bật</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <i className="fas fa-check-circle text-[#008bc3] mr-3 mt-1"></i>
              <span><strong className="font-semibold">Chương trình đạt chuẩn:</strong> Nhiều chương trình đào tạo đã được kiểm định chất lượng giáo dục quốc gia.</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check-circle text-[#008bc3] mr-3 mt-1"></i>
              <span><strong className="font-semibold">Đội ngũ giảng viên:</strong> Giàu kinh nghiệm, năng động, nhiệt huyết, chuyên môn cao và có kinh nghiệm thực tiễn.</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check-circle text-[#008bc3] mr-3 mt-1"></i>
              <span><strong className="font-semibold">Chứng chỉ quốc tế:</strong> Cơ hội nhận các chứng chỉ quốc tế uy tín trong quá trình học.</span>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check-circle text-[#008bc3] mr-3 mt-1"></i>
              <span><strong className="font-semibold">Đào tạo chất lượng:</strong> Tập trung vào cả lý thuyết và thực hành, đảm bảo sinh viên vững vàng kiến thức và kỹ năng.</span>
            </li>
             <li className="flex items-start">
              <i className="fas fa-check-circle text-[#008bc3] mr-3 mt-1"></i>
              <span><strong className="font-semibold">Hoạt động ngoại khóa:</strong> Môi trường năng động với nhiều câu lạc bộ và hoạt động phong phú.</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 md:mt-0">
          <img 
            src="/images/Thongtinnghiencuu.jpg" 
            alt="Giới thiệu Đại học Thủ Dầu Một" 
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>

      <div className="bg-gray-50 py-16 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Hoạt Động Sinh Viên</h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">Khám phá môi trường học tập năng động và sáng tạo qua các hoạt động ngoại khóa tại TDMU.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[ { title: "Nhiệt huyết", img: "team1" }, 
               { title: "Năng động", img: "team2" }, 
               { title: "Sáng tạo", img: "team3" }, 
               { title: "Kỷ luật", img: "team4" } 
             ].map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <img 
                  src={`/images/${item.img}.jpg`} 
                  alt={item.title} 
                  className="w-full h-48 object-cover rounded-md mb-5 shadow-sm"
                />
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{item.title}</h3>
                <div className="flex justify-center space-x-3">
                  <a href="#" className="w-9 h-9 flex items-center justify-center bg-[#008bc3] rounded-full text-white hover:bg-[#0073a8] transition-colors">
                    <i className="fab fa-facebook-f text-lg"></i>
                  </a>
                  <a href="#" className="w-9 h-9 flex items-center justify-center bg-[#008bc3] rounded-full text-white hover:bg-[#0073a8] transition-colors">
                    <i className="fab fa-twitter text-lg"></i>
                  </a>
                  <a href="#" className="w-9 h-9 flex items-center justify-center bg-[#008bc3] rounded-full text-white hover:bg-[#0073a8] transition-colors">
                    <i className="fab fa-instagram text-lg"></i>
                </a>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </>
  );
}