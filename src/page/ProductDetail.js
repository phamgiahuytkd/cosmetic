import {
  TbArrowBackUp,
  TbShoppingBagPlus,
  TbTruckDelivery,
} from "react-icons/tb";
import { RiSecurePaymentLine } from "react-icons/ri";
import { FaHeart, FaRegStar, FaStar } from "react-icons/fa";
import { FaTruckFast } from "react-icons/fa6";
import { BsStars } from "react-icons/bs";
import "../css/ProductDetail.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, Zoom, FreeMode, Scrollbar, Mousewheel } from "swiper/modules";
import ReactStars from "react-rating-stars-component";
import "swiper/css";
import "swiper/css/thumbs";
import "swiper/css/zoom";
import "swiper/css/free-mode";
import "swiper/css";
import "swiper/css/scrollbar";
import { useEffect, useState } from "react";
import {
  formatPrice,
  formatStockNumber,
  getImageUrl,
  handleAddToLove,
  handleRemoveToLove,
} from "../component/commonFunc";
import { IoIosDocument } from "react-icons/io";
import { MdWarehouse } from "react-icons/md";
import { useBrandCategory } from "../component/BrandCategoryContext";
import AttributeSelector from "../component/AttributeSelector";
import { useNavigate, useParams } from "react-router-dom";
import api from "../service/api";
import { BiRefresh, BiSolidCommentDots } from "react-icons/bi";
import { useFavorites } from "../component/FavoriteContext";
import { CiMoneyCheck1 } from "react-icons/ci";
import Swal from "sweetalert2";
import { useCart } from "../component/CartContext";
import ProductDescription from "../component/ProductDescription";
import ProductFeatures from "../component/ProductFeatures";
import ProductReview from "../component/ProductReview";
import GroupProductSlider from "../component/GroupProductSlider";





const ProductDetail = () => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const { brands, categories } = useBrandCategory();
  const [product, setProduct] = useState({});
  const [productVariant, setProductVariant] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [matchedVariant, setMatchedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { favoriteIdSet, fetchFavorites } = useFavorites();
  const [ratingInfo, setRatingInfo] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [selectedGiftIndex, setSelectedGiftIndex] = useState(0);
  const [ratings, setRatings] = useState([]);
  const isLoved = false;
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const { id } = useParams();




  useEffect(() => {
    api
      .get(`/product/${id}`)
      .then((response) => {
        setProduct(response.data.result);
      })
      .catch((error) => {
        console.error(error.response?.data?.message || "Lỗi không xác định");
      });
  }, [id]);


  useEffect(() => {
    api
      .get(`/product-variant/${id}`)
      .then((response) => {
        setProductVariant(response.data.result);
      })
      .catch((error) => {
        console.error(error.response?.data?.message || "Lỗi không xác định");
      });
  }, [id]);


  useEffect(() => {
    api
      .get(`/gift/${matchedVariant?.id}/product-variant`)
      .then((response) => {
        setGifts(response.data.result);

      })
      .catch((error) => {
        console.error(error.response?.data?.message || "Lỗi không xác định");
      });
  }, [matchedVariant]);



  useEffect(() => {
    api
      .get(`/rating/${id}`)
      .then((response) => {
        const startotal = {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        };

        response.data.result.forEach(({ star, count }) => {
          if (startotal.hasOwnProperty(star)) {
            startotal[star] = count;
          }
        });
        
        setRatingInfo(startotal);
      })
      .catch((error) => {
        console.error(error.response?.data?.message || "Lỗi không xác định");
      });
    
    
      api
        .get(`/rating/${id}/ratings`)
        .then((response) => {

          setRatings(response.data.result);
        })
        .catch((error) => {
          console.error(error.response?.data?.message || "Lỗi không xác định");
        });
    
    
    
  }, [id]);


  useEffect(() => {
    if (matchedVariant) {
      setQuantity(1);
    }
  }, [matchedVariant]);

  const handleIncrease = () => {
    if (matchedVariant && quantity < matchedVariant.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        setQuantity(Math.min(Math.max(num, 1), matchedVariant?.stock || 1));
      } else {
        setQuantity("");
      }
    }
  };

  const groupedAttributes = {};
  productVariant.forEach((variant) => {
    variant.attribute_values?.forEach(({ id, attribute_id }) => {
      if (!groupedAttributes[attribute_id]) {
        groupedAttributes[attribute_id] = new Set();
      }
      groupedAttributes[attribute_id].add(id);
    });
  });

  useEffect(() => {
    if (Object.keys(groupedAttributes).length > 0) {
      const initialSelected = {};
      for (const [attributeId, valuesSet] of Object.entries(
        groupedAttributes
      )) {
        initialSelected[attributeId] = [...valuesSet][0]; // lấy giá trị đầu tiên
      }
      setSelectedAttributes(initialSelected);
    }
  }, [productVariant]);

  // Cập nhật biến thể phù hợp
  useEffect(() => {
    const selectedCount = Object.keys(selectedAttributes).length;
    const requiredCount = Object.keys(groupedAttributes).length;

    if (selectedCount === requiredCount) {
      const found = productVariant.find((variant) => {
        return variant.attribute_values.every(
          ({ id, attribute_id }) => selectedAttributes[attribute_id] === id
        );
      });
      setMatchedVariant(found || null);
    } else {
      setMatchedVariant(null);
    }
  }, [selectedAttributes, productVariant]);

  const handleSelect = (attributeId, valueId) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeId]: valueId,
    }));
  };

  const handleAddToCart = (isBuyNow) => {
    const selectedGift = gifts?.[selectedGiftIndex]; // Lấy quà tặng được chọn
    if (isBuyNow) {
      const product_variant = matchedVariant;
      const data = { ...product, product_variant, quantity, selectedGift }; // Thêm quà tặng vào data
      sessionStorage.setItem("buyNowData", JSON.stringify(data));
      navigate("/buynow");
    } else {
      api
        .post("/cart", {
          product_variant_id: matchedVariant.id,
          quantity: quantity,
          selected_gift_id: selectedGift?.id || null, // Gửi gift_id nếu API yêu cầu
        })
        .then(() => {
          fetchCart();
          Swal.fire({
            icon: "success",
            title: "Thành công!",
            text: "Sản phẩm đã được thêm vào giỏ hàng.",
            showConfirmButton: false,
            timer: 1000,
          });
        })
        .catch((err) => {
          if (err.response?.data.code === 3012) {
            Swal.fire({
              icon: "warning",
              title: "Không đủ số lượng!",
              text: "Số lượng sản phẩm trong kho không đủ để thêm vào giỏ hàng.",
              confirmButtonText: "Đồng ý",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Lỗi!",
              text: "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.",
              confirmButtonText: "Đóng",
            });
          }
        });
    }
  };

 



  const [top10DiscountProducts, setTop10DiscountProducts] = useState([]);
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

  return (
    <div>
      <div className="user-product-detail-container">
        <div className="user-product-detail-max-container">
          <div className="user-product-detail-product-card">
            <div className="user-product-detail-image-section">
              {/* Thumbnail images */}
              <div className="user-product-detail-image-thumbnails">
                <Swiper
                  direction="vertical"
                  slidesPerView="auto"
                  spaceBetween={10}
                  freeMode={true}
                  mousewheel={true}
                  watchSlidesProgress
                  onSwiper={setThumbsSwiper}
                  scrollbar={{ draggable: true }}
                  modules={[Thumbs, FreeMode, Scrollbar, Mousewheel]}
                  className="thumbnail-swiper">
                  <SwiperSlide
                    key={0}
                    style={{ width: "5.5rem", height: "5.5rem" }}>
                    <img
                      src={getImageUrl(matchedVariant?.image)}
                      alt={`Thumb ${0}`}
                      className="user-product-detail-thumbnail-image"
                    />
                  </SwiperSlide>
                  {matchedVariant?.images &&
                    matchedVariant.images.split(",").map((filename, i) => (
                      <SwiperSlide
                        key={i + 1}
                        style={{ width: "5.5rem", height: "5.5rem" }}>
                        <img
                          src={getImageUrl(filename.trim())}
                          alt={`Thumb ${i + 1}`}
                          className="user-product-detail-thumbnail-image"
                        />
                      </SwiperSlide>
                    ))}
                </Swiper>
              </div>

              {/* Main image with zoom */}
              <div className="user-product-detail-main-image-container">
                <Swiper
                  spaceBetween={10}
                  loop={true}
                  zoom={true}
                  speed={1000}
                  thumbs={{ swiper: thumbsSwiper }}
                  modules={[Thumbs, Zoom]}
                  className="main-swiper"
                  style={{ width: "100%" }}>
                  <SwiperSlide key={0}>
                    <div className="swiper-zoom-container">
                      <img
                        src={getImageUrl(matchedVariant?.image)}
                        alt={`Main ${0}`}
                        className="user-product-detail-main-image"
                      />
                    </div>
                  </SwiperSlide>
                  {matchedVariant?.images &&
                    matchedVariant.images.split(",").map((imgName, i) => (
                      <SwiperSlide key={i + 1}>
                        <div className="swiper-zoom-container">
                          <img
                            src={getImageUrl(imgName.trim())}
                            alt={`Main ${i + 1}`}
                            className="user-product-detail-main-image"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                </Swiper>
              </div>
            </div>

            <div className="user-product-detail-product-details">
              <h3 className="user-product-detail-product-title">
                {product.name}
              </h3>
              <div className="user-product-detail-rating-container">
                <ReactStars
                  key={matchedVariant?.id}
                  count={5} // tổng số sao
                  value={matchedVariant?.star} // số sao thực tế (ví dụ: 4.5)
                  size={36} // kích thước sao
                  isHalf={true} // cho phép hiển thị nửa sao
                  edit={false} // tắt tương tác (chỉ hiển thị)
                  activeColor="#ffd700" // màu sao vàng
                  classNames="user-product-display-stars"
                />

                <div className="user-product-detail-star">
                  {matchedVariant?.star != null ? (
                    <span>
                      {matchedVariant.star.toFixed(1)}
                      <BsStars size={12} />
                    </span>
                  ) : (
                    <span>. . .</span>
                  )}
                  <div></div>
                  <span>
                    {formatStockNumber(matchedVariant?.rating_quantity)} đánh
                    giá
                  </span>
                </div>
              </div>
              <div className="user-product-detail-product-price">
                <h4 className="user-product-detail-product-price-discount">
                  {matchedVariant?.price && formatPrice(matchedVariant?.price)}
                </h4>
                {matchedVariant?.percent && (
                  <h4 className="user-product-detail-product-price-origin">
                    {formatPrice(
                      (matchedVariant?.price * 100) /
                        (100 - matchedVariant?.percent)
                    )}
                    <strong>-{matchedVariant.percent}%</strong>
                  </h4>
                )}
              </div>
              <ul className="user-product-detail-product-base-info">
                <li>
                  <span>
                    <IoIosDocument />
                    <strong>Mã sản phẩm:</strong> {matchedVariant?.id}
                  </span>
                </li>
                <li>
                  <span>
                    <MdWarehouse />
                    <strong>Số lượng:</strong>{" "}
                    {formatStockNumber(matchedVariant?.stock)}
                  </span>
                </li>
                <li>
                  <span>
                    <strong>Thương hiệu:</strong> {product?.brand_id}
                  </span>
                  <img
                    src={
                      getImageUrl(
                        brands.find((c) => c.id === product?.brand_id)?.image
                      ) || "/image/1 (2).png"
                    }
                    alt="brand"
                  />
                </li>

                <li>
                  <span>
                    <strong>Dòng sản phẩm:</strong> {product?.category_id}
                  </span>
                  <img
                    src={
                      getImageUrl(
                        categories.find((c) => c.id === product?.category_id)
                          ?.image
                      ) || "/image/1 (2).png"
                    }
                    alt="category"
                  />
                </li>
              </ul>
              <div className="user-product-detail-product-variant">
                <AttributeSelector
                  groupedAttributes={groupedAttributes}
                  selectedAttributes={selectedAttributes}
                  handleSelect={handleSelect}
                />
              </div>

              {gifts?.length > 0 && (
                <div className="user-product-detail-gift">
                  <h5>Sản phẩm được tặng kèm:</h5>
                  {gifts.map((gift, index) => (
                    <div
                      className="user-product-detail-gift-card"
                      key={gift.id || index}>
                      <div className="user-product-detail-gift-card-input">
                        <input
                          type="radio"
                          name="gift" // Đảm bảo các radio button thuộc cùng nhóm
                          checked={index === selectedGiftIndex} // Kiểm tra quà tặng được chọn
                          onChange={() => setSelectedGiftIndex(index)} // Cập nhật state khi chọn
                        />
                      </div>
                      <img
                        src={`${getImageUrl(gift.image)}`}
                        alt={`gift-${index}`}
                      />
                      <div className="user-product-detail-gift-card-text">
                        <strong>Tặng:</strong> {gift.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="user-product-detail-button-control">
                <div className="user-product-add-and-buy-now-variant-quantity-container">
                  <div>Số lượng:</div>
                  <div className="user-cart-quantity-control">
                    <button onClick={handleDecrease}>-</button>
                    <input
                      value={quantity}
                      onChange={handleQuantityChange}
                      onBlur={() => {
                        if (!quantity || quantity < 1) {
                          setQuantity(1);
                        }
                      }}
                      onMouseLeave={() => {
                        if (!quantity || quantity < 1) {
                          setQuantity(1);
                        }
                      }}
                    />
                    <button onClick={handleIncrease}>+</button>
                  </div>
                </div>

                <div className="user-product-detail-love">
                  <button
                    className={`user-product-detail-love-button ${
                      favoriteIdSet.has(product.id)
                        ? "user-product-card-is-favorite"
                        : ""
                    }`}
                    onClick={(e) => {
                      if (isLoved) {
                        handleRemoveToLove(
                          e,
                          product,
                          fetchFavorites,
                          navigate
                        );
                      } else {
                        handleAddToLove(e, product, fetchFavorites, navigate);
                      }
                    }}>
                    <FaHeart />
                  </button>
                </div>
              </div>
              <div className="user-product-detail-add-and-buy-now">
                <button
                  className="user-product-detail-add-cart"
                  onClick={() => handleAddToCart(false)}>
                  Thêm vào giỏ hàng <TbShoppingBagPlus />
                </button>
                <button
                  className="user-product-detail-buy-now"
                  onClick={() => handleAddToCart(true)}>
                  Mua ngay <CiMoneyCheck1 />
                </button>
              </div>
              <div className="user-product-detail-delivery-wrapper">
                <div className="user-product-detail-delivery-item">
                  <div className="user-product-detail-delivery-icon-box">
                    <FaTruckFast className="user-product-detail-delivery-icon" />
                  </div>
                  <div className="user-product-detail-delivery-info">
                    <h4 className="user-product-detail-delivery-title">
                      Miễn phí vận chuyển
                    </h4>
                    <p className="user-product-detail-delivery-subtext">
                      Giao hàng tận nơi trên khắp cả nước với giá và không tốn
                      phí
                    </p>
                  </div>
                </div>

                <div className="user-product-detail-delivery-item">
                  <div className="user-product-detail-delivery-icon-box">
                    <BiRefresh className="user-product-detail-delivery-icon" />
                  </div>
                  <div className="user-product-detail-delivery-info">
                    <h4 className="user-product-detail-delivery-title">
                      Chính sách hoàn trả
                    </h4>
                    <p className="user-product-detail-delivery-subtext">
                      Hoàn trả sản phẩm trong vòng 30 ngày, kể từ ngày thanh
                      toán. <a href="#">Chi tiết</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ProductDescription
            description={matchedVariant?.description}
            usage={matchedVariant?.instruction}
            ingredients={matchedVariant?.ingredient}
          />

          <div className="user-product-detail-features-section">
            <ProductFeatures />
          </div>
          <ProductReview reviews={ratings} ratingStats={ratingInfo} />
          <GroupProductSlider products={top10DiscountProducts} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
