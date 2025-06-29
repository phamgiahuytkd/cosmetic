import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ProductCard from "./ProductCard";
import NavigationButton from "./NavigationButton";
import "../css/GroupProductSlider.css";
import { useRef } from "react";

const GroupProductSlider = ({ products }) => {
  const topDiscountPrevRef = useRef(null);
  const topDiscountNextRef = useRef(null);

  if (products.length === 0) return null;

  return (
    <div className="user-group-product">
      <div className="user-group-product-container">
        <h3>
          SẢN PHẨM DÀNH CHO BẠN
        </h3>
        <NavigationButton
          prevRef={topDiscountPrevRef}
          nextRef={topDiscountNextRef}
        />
        <div className="user-home-discount-product-item-container">
          <Swiper
            spaceBetween={20}
            slidesPerView="auto"
            mousewheel={true}
            navigation={{
              prevEl: topDiscountPrevRef.current,
              nextEl: topDiscountNextRef.current,
            }}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = topDiscountPrevRef.current;
              swiper.params.navigation.nextEl = topDiscountNextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            modules={[Navigation]}
            className="user-group-product-swiper">
            {products.map((product) => (
              <SwiperSlide
                key={product.id}
                className="user-group-product-slide">
                <ProductCard key={product.id} product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default GroupProductSlider;
