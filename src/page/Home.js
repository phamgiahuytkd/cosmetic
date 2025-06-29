import "../css/Home.css";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  EffectCoverflow,
  EffectCreative,
  EffectCube,
  Mousewheel,
  Navigation,
  Pagination,
  Thumbs,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-cube";
import "swiper/css/thumbs";
import { useNavigate } from "react-router-dom";
import UserHomeAbout from "./HomeAbout";
import UserHomePromo from "./HomePromo";
import api from "../service/api";
import { getImageUrl, redirectTo } from "../component/commonFunc";
import ProductCard from "../component/ProductCard";
import NavigationButton from "../component/NavigationButton";

export default function Home() {
  const navigate = useNavigate();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const progressCircle = useRef(null);
  const progressContent = useRef(null);
  const [posters, setPosters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [top10DiscountProducts, setTop10DiscountProducts] = useState([]);

  const newPrevRef = useRef(null);
  const newNextRef = useRef(null);
  const topDiscountPrevRef = useRef(null);
  const topDiscountNextRef = useRef(null);

  useEffect(() => {
    api
      .get("/poster")
      .then((res) => {
        setPosters(res.data.result);
      })
      .catch((err) => {
        console.error(
          err.response?.data?.message || "Lỗi lấy danh sách sản phẩm"
        );
      });
  }, []);

  useEffect(() => {
    api
      .get("/category")
      .then((res) => {
        setCategories(res.data.result);
      })
      .catch((err) => {
        console.error(
          err.response?.data?.message || "Lỗi lấy danh sách sản phẩm"
        );
      });
  }, []);

  useEffect(() => {
    api
      .get("/brand")
      .then((res) => {
        setBrands(res.data.result);
      })
      .catch((err) => {
        console.error(
          err.response?.data?.message || "Lỗi lấy danh sách sản phẩm"
        );
      });
  }, []);

  useEffect(() => {
    api
      .get("/product/latest")
      .then((res) => {
        setLatestProducts(res.data.result);
      })
      .catch((err) => {
        console.error(
          err.response?.data?.message || "Lỗi lấy danh sách sản phẩm"
        );
      });
  }, []);

  useEffect(() => {
    api
      .get("/product/top10discount")
      .then((res) => {
        setTop10DiscountProducts(res.data.result);
      })
      .catch((err) => {
        console.error(
          err.response?.data?.message || "Lỗi lấy danh sách sản phẩm"
        );
      });
  }, []);

  const handleClickLink = (link) => {
    navigate(link);
  };

  return (
    <div className="user-home-container">
      <div className="swiper-container">
        {posters.length > 0 && (
          <Swiper
            key={posters.length}
            spaceBetween={50}
            slidesPerView={1}
            loop={posters.length > 1}
            navigation={true}
            speed={2000}
            effect="creative"
            creativeEffect={{
              prev: {
                shadow: true,
                translate: [0, 0, -400],
              },
              next: {
                translate: ["100%", 0, 0],
              },
            }}
            autoplay={{
              delay: 5000, // Thời gian chờ giữa các slide (3 giây)
              disableOnInteraction: false, // Tiếp tục autoplay sau khi người dùng tương tác
            }}
            pagination={{ clickable: true }}
            modules={[EffectCreative, Navigation, Pagination, Autoplay]}
            className="mySwiper">
            {posters.map((item, index) => (
              <SwiperSlide key={index}>
                <img
                  src={getImageUrl(item.image)}
                  alt={`Image ${item.id}`}
                  onClick={() => redirectTo(item.link)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <div className="user-home-category">
        <h2>DANH MỤC NỔI BẬT</h2>
        {categories.length > 0 && (
          <div className="user-home-category-gallery-container">
            <Swiper
              key={categories.length}
              loop={categories.length > 4}
              effect="cube"
              cubeEffect={{
                shadow: true,
                slideShadows: false,
              }}
              speed={1500}
              grabCursor={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              modules={[EffectCube, Thumbs, Autoplay]}
              thumbs={{ swiper: thumbsSwiper }}
              onAutoplayTimeLeft={(s, time, progress) => {
                if (progressCircle.current) {
                  progressCircle.current.style.setProperty(
                    "--progress",
                    1 - progress
                  );
                }
                if (progressContent.current) {
                  progressContent.current.textContent = `${Math.ceil(
                    time / 1000
                  )}s`;
                }
              }}
              className="user-home-category-main-swiper">
              {categories.map((item, idx) => (
                <SwiperSlide key={idx}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={`Slide ${idx}`}
                    className="user-home-category-slide-img"
                    onClick={() =>
                      handleClickLink(`/product?category=${item.id}`)
                    }
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <Swiper
              onSwiper={setThumbsSwiper}
              loop={true}
              spaceBetween={10}
              slidesPerView={4}
              watchSlidesProgress
              mousewheel={true}
              modules={[Thumbs, Mousewheel]}
              className="user-home-category-thumb-swiper">
              {categories.map((item, idx) => (
                <SwiperSlide key={`thumb-${idx}`}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={`Thumb ${idx}`}
                    className="user-home-category-thumb-img"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {top10DiscountProducts.length > 0 && (
        <div className="user-home-discount">
          <div className="user-home-discount-container">
            <h2>
              SIÊU KHUYẾN MÃI
              <div>
                Từ{" "}
                <p>
                  {
                    top10DiscountProducts[top10DiscountProducts.length - 1]
                      .percent
                  }
                  %
                </p>
              </div>
              :
              <div>
                Đến <p>{top10DiscountProducts[0].percent}%</p>
              </div>
            </h2>
            <NavigationButton
              prevRef={topDiscountPrevRef}
              nextRef={topDiscountNextRef}
            />
            <div className="user-home-discount-product-container">
              <Swiper
                spaceBetween={20}
                slidesPerView="auto"
                mousewheel={true}
                navigation={{
                  prevEl: topDiscountPrevRef.current,
                  nextEl: topDiscountNextRef.current,
                }}
                onInit={(swiper) => {
                  // gán nút custom cho swiper sau khi khởi tạo
                  swiper.params.navigation.prevEl = topDiscountPrevRef.current;
                  swiper.params.navigation.nextEl = topDiscountNextRef.current;
                  swiper.navigation.init();
                  swiper.navigation.update();
                }}
                modules={[Navigation]}
                className="user-home-discount-swiper">
                {top10DiscountProducts.map((product) => {
                  return (
                    <SwiperSlide
                      key={product.id}
                      style={{ width: "15.35rem" }}
                      className="user-home-discount-slide">
                      <ProductCard key={product.id} product={product} />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
            {/* <Link to="/">
            <h3>XEM THÊM ƯU ĐÃI</h3>
          </Link> */}
          </div>
        </div>
      )}

      <div className="user-home-brand">
        <h2>THƯƠNG HIỆU UY TÍN</h2>
        <div className="user-home-brand-gallery-container">
          {brands.length > 0 && (
            <Swiper
              modules={[Autoplay, EffectCoverflow, Mousewheel]}
              effect="coverflow"
              speed={1000}
              grabCursor={true}
              centeredSlides={true}
              mousewheel={true}
              slidesPerView={3}
              loop={brands.length > 3}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              onSwiper={(swiper) => {
                setTimeout(() => {
                  if (swiper?.autoplay?.start) {
                    swiper.autoplay.start();
                  }
                }, 100);
              }}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: false,
              }}
              className="user-home-brand-swiper">
              {brands.map((item, index) => (
                <SwiperSlide key={index}>
                  {({ isActive }) => (
                    <img
                      src={getImageUrl(item.image)}
                      alt={`Brand ${index + 1}`}
                      className="user-home-brand-slide-img"
                      onClick={() => {
                        const swiperInstance = document.querySelector(
                          ".user-home-brand-swiper"
                        ).swiper;
                        if (isActive) {
                          handleClickLink(`/product?brand=${item.id}`);
                        } else {
                          // Manually navigate to this slide
                          swiperInstance.slideToLoop(index);
                        }
                      }}
                      style={{ cursor: isActive ? "pointer" : "default" }}
                    />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>

      {latestProducts.length > 0 && (
        <div className="user-home-new">
          <div className="user-home-new-container">
            <h2>SẢN PHẨM MỚI RA MẮT</h2>
            <NavigationButton prevRef={newPrevRef} nextRef={newNextRef} />
            <div className="user-home-discount-product-container">
              <Swiper
                spaceBetween={20}
                slidesPerView="auto"
                watchSlidesProgress={true}
                navigation={{
                  prevEl: newPrevRef.current,
                  nextEl: newNextRef.current,
                }}
                onInit={(swiper) => {
                  // gán nút custom cho swiper sau khi khởi tạo
                  swiper.params.navigation.prevEl = newPrevRef.current;
                  swiper.params.navigation.nextEl = newNextRef.current;
                  swiper.navigation.init();
                  swiper.navigation.update();
                }}
                modules={[Navigation]}
                className="user-home-discount-swiper">
                {latestProducts.map((product) => {
                  return (
                    <SwiperSlide
                      key={product.id}
                      style={{ width: "15.35rem" }}
                      className="user-home-discount-slide">
                      <ProductCard key={product.id} product={product} />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
        </div>
      )}

      <UserHomePromo></UserHomePromo>

      <UserHomeAbout></UserHomeAbout>
    </div>
  );
}
