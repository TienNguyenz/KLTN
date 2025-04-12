import React from 'react';

const LienHePage = () => {
  return (
    <div className="bg-[#06BBCC] py-5 mb-5">
      <div className="container mx-auto py-5 text-center">
        <h1 className="text-4xl text-white font-bold">Liên Hệ</h1>
        <nav className="text-white mt-2">
          <a href="/" className="hover:underline">Trang chủ</a> / <span>Liên Hệ</span>
        </nav>
      </div>

      <div className="container mx-auto py-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h5 className="text-xl font-semibold mb-2">Liên lạc</h5>
          <p>Tôi hi vọng email này đã giải đáp thắc mắc của bạn. Nếu chúng tôi có thể giúp đỡ gì thêm, xin hãy liên hệ.</p>
          <div className="mt-4">
            <p><strong>Office:</strong> Số 06, Trần Văn Ơn, Phú Hòa, Thủ Dầu Một, Bình Dương</p>
            <p><strong>Mobile:</strong> +0274-382-2518</p>
            <p><strong>Email:</strong> tdmu@edu.com.vn</p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1958.3863144248908!2d106.67438525813937!3d10.98052733115031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d1085e2b1c37%3A0x73bfa5616464d0ee!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBUaOG7pyBE4bqndSBN4buZdA!5e0!3m2!1svi!2s!4v1669303703752!5m2!1svi!2s"
            frameBorder="0"
            style={{ minHeight: '300px', border: '0' }}
            allowFullScreen=""
            aria-hidden="false"
            tabIndex="0"
          ></iframe>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <form className="space-y-4">
            <input type="text" placeholder="Họ tên" className="w-full p-2 border rounded-lg" />
            <input type="email" placeholder="Email" className="w-full p-2 border rounded-lg" />
            <input type="text" placeholder="SĐT" className="w-full p-2 border rounded-lg" />
            <textarea placeholder="Nội dung" className="w-full p-2 border rounded-lg" rows="5"></textarea>
            <button type="submit" className="w-full bg-[#06BBCC] text-white py-2 rounded-lg hover:bg-[#0599A8]">
              Gửi nội dung
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LienHePage;