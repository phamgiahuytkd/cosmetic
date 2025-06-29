import React from "react";
import { GiClover } from "react-icons/gi";
import { IoBagAdd } from "react-icons/io5";
import {
  formatPrice,
  formatStockNumber,
  getImageUrl,
  handleAddToCart,
  handleAddToLove,
  handleRemoveToLove,
  isNewProduct,
  setBuyNow,
} from "./commonFunc";
import { useFavorites } from "../component/FavoriteContext";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import ReactStars from "react-rating-stars-component";
import { BiSolidCommentDots } from "react-icons/bi";
import { useAddAndBuyNowModal } from "./AddAndBuyNowModalContext";
import { MdOutlineWarehouse, MdWarehouse } from "react-icons/md";
import { FaStar } from "react-icons/fa6";

const ProductCard = ({ product, isLoved = false }) => {
  const { fetchCart } = useCart();
  const { favoriteIdSet, fetchFavorites, setOpenLoveModal } = useFavorites();
  const navigate = useNavigate();
  const { setOpenAddAndBuyNowModal, setAddAndBuyNowProduct } =
    useAddAndBuyNowModal();
  

  return (
    <div
      className="user-product-card"
      onClick={() => navigate(`/product-detail/${product.id}`)}>
      {product.percent !== null && (
        <span className="user-product-card-discount">-{product.percent}%</span>
      )}

      {product.gift_stock > 0 && (
        <div className="user-product-card-gift">
          <div>
            <img
              src={getImageUrl(product.gift_image)}
              alt={product.gift_name}
            />
          </div>
          <div className="user-product-card-gift-text">
            Tặng: {product.gift_name}
          </div>
        </div>
      )}

      <button
        className={`user-product-card-love ${
          favoriteIdSet.has(product.id) ? "user-product-card-is-favorite" : ""
        }`}
        onClick={(e) => {
          if (isLoved) {
            handleRemoveToLove(e, product, fetchFavorites, navigate);
          } else {
            handleAddToLove(e, product, fetchFavorites, navigate);
          }
        }}>
        <GiClover />
      </button>

      <div className="user-product-card-image">
        <img src={getImageUrl(product.image)} alt={product.name} />
      </div>

      <div className="user-product-card-view">
        <div className="user-product-card-info">
          <h4>{product.name}</h4>
          <h5>{product.brand_id}</h5>
          <div className="user-product-card-rating">
            <ReactStars
              key={product.id}
              count={5} // tổng số sao
              value={product?.star} // số sao thực tế (ví dụ: 4.5)
              size={18} // kích thước sao
              isHalf={true} // cho phép hiển thị nửa sao
              edit={false} // tắt tương tác (chỉ hiển thị)
              activeColor="#ffd700" // màu sao vàng
            />
            <div className="user-product-card-rating-score">
              {product?.star != null ? (
                <span>
                  <div>
                    <p>{product.star.toFixed(1)} </p>
                    <FaStar size={9} />
                  </div>
                </span>
              ) : (
                <span>
                  <BiSolidCommentDots />
                </span>
              )}

              <span>
                <div>
                  <p>{formatStockNumber(product?.stock)} </p>
                  <MdOutlineWarehouse size={11} />
                </div>
              </span>
            </div>
          </div>

          <div className="user-product-card-price">
            {product.percent !== null ? (
              <div className="user-product-card-price-number">
                <span className="user-product-card-price-discount">
                  {formatPrice(product.price)}
                </span>
                <span className="user-product-card-price-ogirin">
                  {formatPrice((product.price * 100) / (100 - product.percent))}
                </span>
              </div>
            ) : (
              <span>{formatPrice(product.price)}</span>
            )}

            {isNewProduct(product.create_day) && (
              <div className="user-product-card-new">
                <span>New</span>
              </div>
            )}
          </div>
        </div>

        <div className="user-product-card-buy">
          <button
            className="user-product-card-buy-cart"
            onClick={(e) =>
              handleAddToCart(
                e,
                product,
                fetchCart,
                navigate,
                setOpenAddAndBuyNowModal,
                setAddAndBuyNowProduct
              )
            }>
            <IoBagAdd />
          </button>
          <button
            className="user-product-card-buy-now"
            onClick={(e) =>
              setBuyNow(
                e,
                product,
                1,
                navigate,
                setOpenAddAndBuyNowModal,
                setAddAndBuyNowProduct,
                setOpenLoveModal
              )
            }>
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
