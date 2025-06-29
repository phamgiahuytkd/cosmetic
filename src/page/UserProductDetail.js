import React, { useState, useEffect } from "react";
import "../css/ProductDetail.css";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

// Import icons
import { FaHeart, FaRegHeart, FaPlus, FaMinus } from "react-icons/fa";
import { Zoom } from "react-toastify";

const UserProductDetail = () => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Dữ liệu sản phẩm
  const product = {
    name: "PHẤN NƯỚC SIÊU KIỀM DẦU SUPERMATTE CUSHION",
    originalPrice: 359000,
    price: 269000,
    stock: 10,
    description: `
      Sản phẩm đạt giải thưởng "Sản phẩm đẹp nhất năm 2023" tại Đẹp Awards 2023. Phấn nước siêu kiềm dầu với công thức đặc biệt giúp kiểm soát dầu thừa, mang lại lớp nền mịn màng, tự nhiên suốt cả ngày. Hương thơm nhẹ nhàng từ Lemonade, phù hợp với mọi loại da.
    `,
  };

  // Danh sách ảnh từ dữ liệu ban đầu
  const images = [
    {
      src: "//product.hstatic.net/1000303351/product/19_2932277592bb484bb952df42e881fd80_master.png",
      largeSrc:
        "//product.hstatic.net/1000303351/product/19_2932277592bb484bb952df42e881fd80_large.png",
      id: "1536891126",
    },
    {
      src: "//product.hstatic.net/1000303351/product/spm_2_eeb35eb23783480f9a7906417a3df9da_master.png",
      largeSrc:
        "//product.hstatic.net/1000303351/product/spm_2_eeb35eb23783480f9a7906417a3df9da_large.png",
      id: "1369615165",
    },
    {
      src: "//product.hstatic.net/1000303351/product/1__4___1__af74ea8986194c56ae44746de4ee004c_master.png",
      largeSrc:
        "//product.hstatic.net/1000303351/product/1__4___1__af74ea8986194c56ae44746de4ee004c_large.png",
      id: "1386001010",
    },
    {
      src: "//product.hstatic.net/1000303351/product/anh_8_2269b69a3fd74d189dfc6c63abb906c8_master.png",
      largeSrc:
        "//product.hstatic.net/1000303351/product/anh_8_2269b69a3fd74d189dfc6c63abb906c8_large.png",
      id: "1318353392",
    },
    {
      src: "//product.hstatic.net/1000303351/product/00._extra_light_ec29f17922da4681a6cd06a595a719ca_master.png",
      largeSrc:
        "//product.hstatic.net/1000303351/product/00._extra_light_ec29f17922da4681a6cd06a595a719ca_large.png",
      id: "1360607091",
    },
   
  ];

  const handleAddToCart = () => {
    alert(`${quantity} ${product.name}(s) have been added to your cart!`);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    alert(
      isFavorite
        ? `${product.name} has been removed from your favorites!`
        : `${product.name} has been added to your favorites!`
    );
  };

  const handleThumbClick = (index) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      thumbsSwiper.slideTo(0, 500); // Trượt lên vị trí 0 với hiệu ứng
    }
  };

  const handleMainSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
  };

  const handleImageError = (e) => {
    e.target.src =
      "https://via.placeholder.com/600x600.png?text=Image+Not+Found";
  };

  const handleIncreaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="user-product-detail-container">
      <div className="user-product-detail-display">
        {/* Phần ảnh */}
        <div className="productWrapLeft">
          {/* Phần ảnh phụ (thumbImage) */}
          <div className="thumbImage slick-initialized slick-slider slick-vertical">
            <Swiper
              direction="vertical"
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[Thumbs]}
              className="slick-list draggable"
              style={{ height: "576px" }}
              onSlideChange={(swiper) => handleThumbClick(swiper.realIndex)}>
              {images.map((image, index) => (
                <SwiperSlide
                  key={image.id}
                  className={`thumbImageItem slick-slide ${
                    activeIndex === index ? "slick-current slick-active" : ""
                  }`}
                  style={{ width: "134px" }}>
                  <a
                    href="javascript:void(0);"
                    data-source={image.src}
                    data-zoom={image.src}
                    data-id={image.id}
                    onClick={() => handleThumbClick(index)}>
                    <picture>
                      <source
                        media="(max-width: 480px)"
                        srcSet={image.largeSrc}
                      />
                      <source
                        media="(min-width: 481px)"
                        srcSet={image.largeSrc}
                      />
                      <img
                        src={image.largeSrc}
                        alt={product.name}
                        className="img-fluid"
                        onError={handleImageError}
                      />
                    </picture>
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Phần ảnh chính (featureImage) */}
          <div className="featureImage slick-initialized slick-slider">
            <button
              type="button"
              className="slick-prev slick-arrow"
              style={{ display: "block" }}>
              <i className="lni lni-chevron-left"></i>
            </button>
            <Swiper
              spaceBetween={10}
              slidesPerView={1}
              zoom={true}
              navigation={{
                nextEl: ".slick-next",
                prevEl: ".slick-prev",
              }}
              thumbs={{ swiper: thumbsSwiper }}
              modules={[Zoom, Navigation, Thumbs]}
              className="slick-list draggable"
              onSlideChange={handleMainSlideChange}>
              {images.map((image, index) => (
                <SwiperSlide
                  key={image.id}
                  className={`slick-slide ${
                    activeIndex === index ? "slick-current slick-active" : ""
                  }`}
                  style={{ width: "496px" }}>
                  <a
                    href={image.src}
                    data-source={image.src}
                    data-zoom={image.src}
                    data-id={image.id}
                    className="featureImageItem">
                    <picture>
                      <source
                        media="(max-width: 480px)"
                        srcSet={image.src.replace("_master", "_grande")}
                      />
                      <source media="(min-width: 481px)" srcSet={image.src} />
                      <img
                        src={image.src}
                        alt={product.name}
                        className="img-fluid"
                        onError={handleImageError}
                      />
                    </picture>
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
            <button
              type="button"
              className="slick-next slick-arrow"
              style={{ display: "block" }}>
              <i className="lni lni-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Phần thông tin sản phẩm */}
        <div className="user-product-detail-info-section">
          <h1 className="user-product-detail-title">{product.name}</h1>
          <div className="user-product-detail-price-section">
            <span className="user-product-detail-price">
              {product.price.toLocaleString()}₫
            </span>
            {product.originalPrice && (
              <span className="user-product-detail-original-price">
                {product.originalPrice.toLocaleString()}₫
              </span>
            )}
          </div>
          <div className="user-product-detail-quantity-section">
            <button
              className="user-product-detail-quantity-btn"
              onClick={handleDecreaseQuantity}
              disabled={quantity <= 1}>
              <FaMinus />
            </button>
            <span className="user-product-detail-quantity">{quantity}</span>
            <button
              className="user-product-detail-quantity-btn"
              onClick={handleIncreaseQuantity}
              disabled={quantity >= product.stock}>
              <FaPlus />
            </button>
          </div>
          <div className="user-product-detail-actions">
            <button
              className="user-product-detail-add-to-cart"
              onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </button>
            <button
              className="user-product-detail-favorite"
              onClick={handleToggleFavorite}>
              {isFavorite ? (
                <FaHeart className="user-product-detail-favorite-icon active" />
              ) : (
                <FaRegHeart className="user-product-detail-favorite-icon" />
              )}
              {isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
            </button>
          </div>
        </div>
      </div>

      {/* Phần mô tả sản phẩm */}
      <div className="user-product-detail-description-section">
        <h2 className="user-product-detail-description-title">
          Mô tả sản phẩm
        </h2>
        <p className="user-product-detail-description-content">
          {product.description}
        </p>
      </div>
    </div>
  );
};

export default UserProductDetail;
