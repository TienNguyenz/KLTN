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
          <h2 className="text-3xl font-bold text-gray-800">Về Đại Học Sài Gòn (SGU)</h2>
          <p className="text-gray-600 leading-relaxed">
            Trường Đại học Sài Gòn (SGU) là trường đại học công lập đa ngành, trực thuộc UBND TP.HCM, được thành lập từ năm 1976. SGU đào tạo nguồn nhân lực chất lượng cao, nghiên cứu khoa học, chuyển giao công nghệ phục vụ phát triển kinh tế - xã hội khu vực phía Nam và cả nước.
          </p>
          <div className="bg-gray-50 p-6 rounded-xl shadow mb-4">
            <h3 className="text-2xl font-semibold text-[#008bc3] mb-2">Sứ mệnh</h3>
            <p className="text-gray-700">Đào tạo nguồn nhân lực chất lượng cao, nghiên cứu khoa học, chuyển giao công nghệ phục vụ phát triển kinh tế - xã hội khu vực phía Nam và cả nước.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow mb-4">
            <h3 className="text-2xl font-semibold text-[#008bc3] mb-2">Tầm nhìn</h3>
            <p className="text-gray-700">Đến năm 2030, trở thành trường đại học định hướng ứng dụng hàng đầu khu vực phía Nam, hội nhập quốc tế.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow mb-4">
            <h3 className="text-2xl font-semibold text-[#008bc3] mb-2">Giá trị cốt lõi</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Chất lượng - Sáng tạo - Hội nhập - Trách nhiệm xã hội</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow mb-4">
            <h3 className="text-2xl font-semibold text-[#008bc3] mb-2">Thành tựu nổi bật</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Top 50 trường đại học hàng đầu Việt Nam</li>
              <li>30+ ngành đào tạo đại học, 7 ngành sau đại học</li>
              <li>Hơn 20.000 sinh viên, 800 cán bộ giảng viên</li>
              <li>Hợp tác quốc tế với nhiều trường đại học lớn trên thế giới</li>
              <li>Nhiều sinh viên đạt giải thưởng quốc gia, quốc tế</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 md:mt-0 flex flex-col gap-6">
          <img
            src="/images/sgu_campus2.jpg"
            alt="Khuôn viên Đại học Sài Gòn"
            className="w-full h-64 object-cover rounded-lg shadow-lg mb-4"
          />
          <img
            src="/images/sgu_students.jpg"
            alt="Sinh viên SGU"
            className="w-full h-64 object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>

      <div className="bg-gray-50 py-16 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Hoạt Động Sinh Viên SGU</h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">SGU tạo điều kiện cho sinh viên phát triển toàn diện qua các hoạt động ngoại khóa, câu lạc bộ, phong trào tình nguyện, nghiên cứu khoa học, giao lưu quốc tế...</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[ { title: "Năng động", img: "sgu_team1" }, 
               { title: "Sáng tạo", img: "sgu_team2" }, 
               { title: "Hội nhập", img: "sgu_team3" }, 
               { title: "Trách nhiệm", img: "sgu_team4" } 
             ].map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col items-center">
                <img
                  src={`/images/${item.img}.jpg`}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-md mb-5 shadow-sm"
                />
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{item.title}</h3>
                <button
                  className="mt-auto px-6 py-2 bg-[#008bc3] text-white rounded-full font-semibold hover:bg-[#0073a8] transition-all duration-300 shadow"
                  onClick={() => alert(`Thông tin chi tiết về hoạt động: ${item.title}`)}
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}