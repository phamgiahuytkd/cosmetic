import "../css/HomeAbout.css";

const HomeAbout = () => {
  return (
    <section className="user-home-about">
      <div className="user-home-about-container">
        <div className="user-home-about-top">
          <span>
            <img
              className=" lazyloaded"
              src="//theme.hstatic.net/1000303351/1001070461/14/home_about_top.png?v=2003"
              data-src="//theme.hstatic.net/1000303351/1001070461/14/home_about_top.png?v=2003"
              alt="home-about-top"
            />
          </span>
          <div className="user-home-about-title">
            <div>
              <span>H2-COSMETICS MANG ĐẾN</span>
              <h2>
                Giải Pháp Trang Điểm <br /> Dễ Dàng Cho Phụ Nữ Việt
              </h2>
            </div>
            <p>
              Dựa trên kinh nghiệm 15 năm chinh chiến trong ngành làm đẹp và hợp
              tác với các tập đoàn mỹ phẩm nổi tiếng trên Thế giới, Makeup
              Artist Mỹ Huyền cùng cộng sự Huy đã tạo nên thương hiệu mỹ phẩm
              H2-Cosmetics. Với các dòng sản phẩm đa công năng và tiện dụng được
              nghiên cứu dựa trên khí hậu và làn da của phụ nữ Việt,
              H2-Cosmetics giúp bạn hoàn thiện vẻ đẹp một cách nhanh chóng và dễ
              dàng hơn: Dễ dàng sử dụng, dễ dàng kết hợp và dễ dàng mang đi.
            </p>
          </div>
        </div>
        <div className="user-home-about-bot">
          <span>
            <img
              className=" ls-is-cached lazyloaded"
              src="//theme.hstatic.net/1000303351/1001070461/14/home_about_bot.png?v=2003"
              data-src="//theme.hstatic.net/1000303351/1001070461/14/home_about_bot.png?v=2003"
              alt="home-about-bot"
            />
          </span>
        </div>
      </div>
    </section>
  );
};

export default HomeAbout;
