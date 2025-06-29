import React from "react";
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-col">
          <h4>ABOUT US</h4>
          <p>H2 COSMETIC - CÔNG TY CỔ PHẦN GENA THÁI BÌNH DƯƠNG</p>
          <p>MÃ SỐ DOANH NGHIỆP: 0909009</p>
          <a href="#">Câu chuyện thương hiệu</a>
          <a href="#">Hướng dẫn mua hàng</a>
          <img
            src={"/logoSaleNoti-removebg-preview.png"}
            alt="Đã thông báo"
            className="footer-img"
          />
        </div>

        <div className="footer-col">
          <h4>CHÍNH SÁCH</h4>
          <a href="#">Chính sách giao hàng</a>
          <a href="#">Chính sách thành viên</a>
          <a href="#">Chính sách đổi trả</a>
          <a href="#">Chính sách bảo mật thông tin</a>
          <a href="#">Chính sách bán sỉ</a>
          <a href="#">Hướng dẫn đăng ký thẻ thành viên</a>
        </div>

        <div className="footer-col">
          <h4>LIÊN HỆ</h4>
          <a href="#">Trang liên hệ</a>
        </div>

        <div className="footer-col">
          <h4>FANPAGE</h4>
          <a href="#">H2-Cosmetics</a>
          <div className="footer-socials">
            <img
              src="/icon/tiktok.png"
              alt="TikTok"
            />
            <img
              src="/icon/facebook.png"
              alt="Facebook"
            />
            <img
              src="/icon/zalo.png"
              alt="Zalo"
            />
            <img
              src="/icon/phone.png"
              alt="Phone"
            />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-logo">
          <img
            src="/z6575119271173_4013092750fef932771162ce626270fa-removebg-preview.png"
            alt="Logo"
          />
        </div>
        <p>Copyright © 2025 LEMONADE Powered by Haravan</p>
      </div>
    </footer>
  );
};

export default Footer;
