import { Link } from "react-router-dom";

export default function News() {
    const articles = [
      {
        id: 1,
        title: "Đ/c Nguyễn Thị Thương trúng cử BCH Đoàn TNCS Hồ Chí Minh tỉnh Bình Dương khóa XI",
        date: "05/10/2022, Bình Dương",
        description: "Diễn ra trong 2 ngày (3-4/10/2022) tại Trung tâm Hội nghị và Triển lãm tỉnh Bình Dương, Đại hội đại biểu Đoàn TNCS Hồ Chí Minh tỉnh Bình Dương lần thứ XI, nhiệm kỳ 2022-2027 đã thành công tốt đẹp...",
        image: "/images/tt1.jpg",
        link: "/news/article-1"
      },
      {
        id: 2,
        title: "SV ngành Kỹ thuật môi trường học tập thực tế tại các tỉnh miền Tây",
        date: "05/10/2022, Bình Dương",
        description: "Từ ngày 26/09 – 30/09/2022, sinh viên năm 3 và năm 4 ngành Kỹ thuật môi trường đã thực hiện đợt thực tập thực tế tại chuỗi đơn vị xử lý môi trường...",
        image: "/images/tt2.jpg",
        link: "/news/article-2"
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
          <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Tin Tức Gần Đây</h2>
  
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
                      className="inline-flex items-center text-[#008bc3] font-semibold hover:text-[#0073a8] transition-colors"
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
  