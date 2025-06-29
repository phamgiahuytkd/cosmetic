import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { formatPrice, formatStockNumber, getBuyNow, getImageUrl, RequireLoginAlert } from "./commonFunc";
import { FaStar } from "react-icons/fa";
import "../css/AddAndBuyNowModel.css";
import { toast } from "react-toastify";
import api from "../service/api";
import Swal from "sweetalert2";
import AttributeSelector from "./AttributeSelector";

Modal.setAppElement("#root");

const AddAndBuyNowModel = ({
  isOpen,
  onClose,
  addAndBuyNowProduct = [],
  product,
  fetchCart,
  navigate,
  isBuyNow,
  setOpenLoveModal,
}) => {
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [matchedVariant, setMatchedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

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

  // Gom nhóm thuộc tính
  const groupedAttributes = {};
  addAndBuyNowProduct.forEach((variant) => {
    variant.attribute_values?.forEach(({ id, attribute_id }) => {
      if (!groupedAttributes[attribute_id]) {
        groupedAttributes[attribute_id] = new Set();
      }
      groupedAttributes[attribute_id].add(id);
    });
  });

  // Gán mặc định giá trị đầu tiên khi modal mở hoặc sản phẩm thay đổi
  useEffect(() => {
    if (isOpen && Object.keys(groupedAttributes).length > 0) {
      const initialSelected = {};
      for (const [attributeId, valuesSet] of Object.entries(
        groupedAttributes
      )) {
        initialSelected[attributeId] = [...valuesSet][0]; // lấy giá trị đầu tiên
      }
      setSelectedAttributes(initialSelected);
    }
  }, [isOpen, addAndBuyNowProduct]);

  // Cập nhật biến thể phù hợp
  useEffect(() => {
    const selectedCount = Object.keys(selectedAttributes).length;
    const requiredCount = Object.keys(groupedAttributes).length;

    if (selectedCount === requiredCount) {
      const found = addAndBuyNowProduct.find((variant) => {
        return variant.attribute_values.every(
          ({ id, attribute_id }) => selectedAttributes[attribute_id] === id
        );
      });
      setMatchedVariant(found || null);
    } else {
      setMatchedVariant(null);
    }
  }, [selectedAttributes, addAndBuyNowProduct]);

  // Khi chọn 1 giá trị
  const handleSelect = (attributeId, valueId) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeId]: valueId,
    }));
  };

  const handleAddToCart = () => {
    if (isBuyNow) {
      const product_variant = matchedVariant;
      const data = { ...product, product_variant, quantity }; // gộp tất cả thông tin sản phẩm + số lượng
      sessionStorage.setItem("buyNowData", JSON.stringify(data));
      onClose();
      setTimeout(() => {
        setOpenLoveModal(false);
        navigate("/buynow");
      }, 200);
    } else {
      api
        .post("/cart", {
          product_variant_id: matchedVariant.id,
          quantity: quantity,
        })
        .then(() => {
          // gọi lại nếu có
          fetchCart();
          onClose();
          setTimeout(() => {
            Swal.fire({
              icon: "success",
              title: "Thành công!",
              text: "Sản phẩm đã được thêm vào giỏ hàng.",
              showConfirmButton: false,
              timer: 1000,
            });
          }, 200);
        })
        .catch((err) => {
          if (err.response?.data.code === 3012) {
            setTimeout(() => {
              Swal.fire({
                icon: "warning",
                title: "Không đủ số lượng!",
                text: "Số lượng sản phẩm trong kho không đủ để thêm vào giỏ hàng.",
                confirmButtonText: "Đồng ý",
              });
            }, 200);
          } else {
            setTimeout(() => {
              Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.",
                confirmButtonText: "Đóng",
              });
            }, 200);
          }
        });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={{
        base: "user-product-add-and-buy-now-modal",
        afterOpen: "user-product-add-and-buy-now-modal--after-open",
        beforeClose: "user-product-add-and-buy-now-modal--after-close",
      }}
      overlayClassName={{
        base: "user-product-add-and-buy-now-overlay",
        afterOpen: "user-product-add-and-buy-now-overlay--after-open",
        beforeClose: "user-product-add-and-buy-now-overlay--after-close",
      }}
      closeTimeoutMS={300}>
      <div className="user-product-add-and-buy-now-modal-content">
        <div>
          <button
            className="user-product-add-and-buy-now-close"
            onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Hiển thị biến thể phù hợp */}
        {matchedVariant ? (
          <div className="user-product-add-and-buy-now-variant-display">
            <div className="user-product-add-and-buy-now-variant-image-container">
              {matchedVariant.percent !== null && (
                <span className="user-product-card-discount">
                  -{matchedVariant.percent}%
                </span>
              )}{" "}
              <img
                src={getImageUrl(matchedVariant.image)}
                alt="variant"
                className="user-product-add-and-buy-now-variant-image"
              />
            </div>

            <div className="user-product-add-and-buy-now-variant-info">
              <div className="user-product-add-and-buy-now-variant-price">
                {matchedVariant.percent ? (
                  <div className="user-product-add-and-buy-now-variant-price-discount">
                    <span>
                      {" "}
                      {matchedVariant.price &&
                        formatPrice(matchedVariant.price)}
                    </span>
                    <span>
                      {" "}
                      {formatPrice(
                        (matchedVariant.price * 100) /
                          (100 - matchedVariant.percent)
                      )}
                    </span>
                  </div>
                ) : (
                  <div>
                    {matchedVariant.price && formatPrice(matchedVariant.price)}
                  </div>
                )}
              </div>

              <h3>{matchedVariant.name}</h3>

              <div className="user-product-add-and-buy-now-variant-star">
                {matchedVariant.star?.toFixed(1)} <FaStar />
                {" / "}{" "}
                {matchedVariant.rating_quantity &&
                  formatStockNumber(matchedVariant.rating_quantity)}
              </div>

              <div className="user-product-add-and-buy-now-variant-stock">
                Kho:{" "}
                {matchedVariant.stock &&
                  formatStockNumber(matchedVariant.stock)}
              </div>
            </div>
          </div>
        ) : (
          <p
            style={{ marginTop: "20px" }}
            className="user-product-add-and-buy-now-warning">
            {Object.keys(selectedAttributes).length ===
            Object.keys(groupedAttributes).length
              ? "Không tìm thấy biến thể phù hợp."
              : "Vui lòng chọn đầy đủ các phân loại."}
          </p>
        )}

        {/* Vẽ lựa chọn thuộc tính */}
        <AttributeSelector
          groupedAttributes={groupedAttributes}
          selectedAttributes={selectedAttributes}
          handleSelect={handleSelect}
        />

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
            />
            <button onClick={handleIncrease}>+</button>
          </div>
        </div>
        <div className="user-product-add-and-buy-now-variant-button-container">
          <button onClick={handleAddToCart}>
            {isBuyNow ? "Mua ngay" : "Thêm vào giỏ hàng"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddAndBuyNowModel;
