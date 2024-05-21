import React from "react";

function Footer() {
  return (
    <footer className="footer text-light pt-3">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Thông tin liên hệ</h5>
            <p>Đại học Sài Gòn</p>
            <p>273 An Dương Vương, Phường 3, Quận 5, TP. HCM</p>
            <p>Email: info@saigonuniversity.edu.vn</p>
            <p>Điện thoại: (84) 123 456 789</p>
          </div>
          <div className="col-md-6">
            <h5>Liên kết nhanh</h5>
            <ul className="list-unstyled">
              <li>Trang chủ</li>
              <li>Giới thiệu</li>
              <li>Chương trình học</li>
              <li>Tin tức</li>
              <li>Liên hệ</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
