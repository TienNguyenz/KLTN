import { Link } from "react-router-dom";

export default function News() {
    const articles = [
      {
        id: 1,
        title: "SGU tổ chức hội thảo quốc tế về chuyển đổi số trong giáo dục",
        date: "15/04/2024, TP.HCM",
        description: "Hội thảo quy tụ các chuyên gia, nhà khoa học trong và ngoài nước, chia sẻ kinh nghiệm chuyển đổi số trong giáo dục đại học.",
        image: "/images/sgu_news1.jpg",
        link: "/news/article-1"
      },
      {
        id: 2,
        title: "Sinh viên SGU đạt giải thưởng Olympic Tin học toàn quốc",
        date: "10/03/2024, TP.HCM",
        description: "Đội tuyển sinh viên SGU xuất sắc giành nhiều giải thưởng tại Olympic Tin học sinh viên toàn quốc lần thứ 31.",
        image: "/images/sgu_news2.jpg",
        link: "/news/article-2"
      },
      {
        id: 3,
        title: "SGU ký kết hợp tác với doanh nghiệp công nghệ hàng đầu",
        date: "01/03/2024, TP.HCM",
        description: "Lễ ký kết hợp tác chiến lược giữa SGU và các doanh nghiệp công nghệ, mở rộng cơ hội thực tập và việc làm cho sinh viên.",
        image: "/images/sgu_news3.jpg",
        link: "/news/article-3"
      },
    ];
  
    return (
      <>
        <div className="bg-[#008bc3] py-6 mb-8">
          <div className="container mx-auto px-4">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">Tin Tức</h1>
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
  