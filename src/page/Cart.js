import React, { useEffect, useState } from "react";
import "../css/Cart.css";
import { MdDeleteForever } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../component/CartContext";
import { getImageUrl } from "../component/commonFunc";
import api from "../service/api";
import Swal from "sweetalert2";
import { FaGift } from "react-icons/fa";

const Cart = () => {
  const { cartItems, giftItems, fetchCart } = useCart();

  const [itemsInCart, setItemsInCart] = useState([]);
  const [updatedIndex, setUpdatedIndex] = useState(null);
  const navigate = useNavigate();
  const [tempQuantities, setTempQuantities] = useState({});

  useEffect(() => {
    setItemsInCart(cartItems);
    console.log(cartItems);
    const initQuantities = {};
    cartItems.forEach((item, index) => {
      initQuantities[index] = item.quantity.toString();
    });
    setTempQuantities(initQuantities);
  }, [cartItems]);

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const updateCartItem = (item) => {
    api
      .put(`/cart/${item.id}`, { quantity: item.quantity }) // Cập nhật theo ID sản phẩm
      .then((res) => fetchCart())
      .catch((err) =>
        console.error("Lỗi cập nhật:", err.response?.data?.message)
      );
  };

  const handleRemoveItem = (index) => {
    const item = itemsInCart[index];

    Swal.fire({
      title: "Xác nhận xóa",
      text: `Bạn có chắc muốn xóa "${item.name}" khỏi giỏ hàng không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        api
          .delete(`/cart/${item.id}`)
          .then(() => {
            const updatedItems = itemsInCart.filter((_, i) => i !== index);
            setItemsInCart(updatedItems);
            Swal.fire(
              "Đã xóa!",
              "Sản phẩm đã được xóa khỏi giỏ hàng.",
              "success"
            );
            fetchCart();
          })
          .catch((err) => {
            console.error("Lỗi khi xóa sản phẩm:", err.response?.data?.message);
            Swal.fire("Lỗi!", "Xóa sản phẩm thất bại!", "error");
          });
      }
    });
  };

  const handleIncrease = (index) => {
    const updatedItems = [...itemsInCart];
    if (updatedItems[index].quantity < updatedItems[index].stock) {
      updatedItems[index].quantity += 1;
      setItemsInCart(updatedItems);
      setTempQuantities((prev) => ({
        ...prev,
        [index]: updatedItems[index].quantity.toString(),
      }));
      setUpdatedIndex(index);
    }
  };

  const handleDecrease = (index) => {
    const updatedItems = [...itemsInCart];
    if (updatedItems[index].quantity > 1) {
      updatedItems[index].quantity -= 1;
      setItemsInCart(updatedItems);
      setTempQuantities((prev) => ({
        ...prev,
        [index]: updatedItems[index].quantity.toString(),
      }));
      setUpdatedIndex(index);
    }
  };

  const testQuantityInput = (index, value, itemsInCart) => {
    const item = itemsInCart[index];
    const stock = item?.stock ?? 0;
    const currentQuantity = item?.quantity ?? 1;

    if (!/^\d+$/.test(value)) {
      return currentQuantity;
    }

    const numericValue = parseInt(value, 10);

    if (numericValue < 1) {
      return currentQuantity;
    }

    if (numericValue > stock) {
      return stock;
    }

    return numericValue;
  };

  const total = itemsInCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="user-cart-container">
      <div className="user-cart-content">
        <div className="user-cart-left">
          <h2 className="user-cart-title">Giỏ hàng của bạn</h2>
          {itemsInCart.length > 0 ? (
            <div className="user-cart-items">
              {itemsInCart.map((item, index) => (
                <>
                  <div
                    className="user-cart-item"
                    key={index}
                    onMouseLeave={() => {
                      if (updatedIndex === index) {
                        updateCartItem(cartItems[index]);
                        setUpdatedIndex(null); // reset để tránh gọi lại nhiều lần
                      }
                    }}>
                    <div className="user-cart-item-left">
                      <button
                        className="user-cart-remove-btn"
                        onClick={() => handleRemoveItem(index)}>
                        <MdDeleteForever />
                      </button>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.id}
                        className="user-cart-item-image"
                      />
                      <div className="user-cart-item-info">
                        <div className="user-cart-item-name">{item.name}</div>
                        <div className="user-cart-item-brand">
                          {item?.attribute_values
                            .map((attr) => `${attr.attribute_id}: ${attr.id}`)
                            .join(", ")}
                        </div>
                        <div className="user-cart-item-price">
                          {item.price.toLocaleString()}₫
                          {item.percent != null && item.percent > 0 && (
                            <span className="user-cart-item-original-price">
                              {(
                                item.price /
                                (1 - item.percent / 100)
                              ).toLocaleString()}
                              ₫
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="user-cart-item-right">
                      <strong>
                        {(item.price * item.quantity).toLocaleString()}₫
                      </strong>
                      <div className="user-cart-quantity-control">
                        <button onClick={() => handleDecrease(index)}>-</button>

                        <input
                          name={item.id}
                          value={tempQuantities[index] ?? item.quantity}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setTempQuantities((prev) => ({
                              ...prev,
                              [index]: newValue,
                            }));
                          }}
                          onMouseLeave={(e) => {
                            const validValue = testQuantityInput(
                              index,
                              e.target.value,
                              itemsInCart
                            );
                            const updatedItems = [...itemsInCart];
                            updatedItems[index].quantity = validValue;
                            setItemsInCart(updatedItems);
                            setTempQuantities((prev) => ({
                              ...prev,
                              [index]: validValue.toString(),
                            }));
                            setUpdatedIndex(index);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault(); // tránh submit form nếu có
                              const validValue = testQuantityInput(
                                index,
                                e.target.value,
                                itemsInCart
                              );
                              const updatedItems = [...itemsInCart];
                              updatedItems[index].quantity = validValue;
                              setItemsInCart(updatedItems);
                              setTempQuantities((prev) => ({
                                ...prev,
                                [index]: validValue.toString(),
                              }));
                              setUpdatedIndex(index);
                              e.target.blur(); // tự động rời khỏi input sau khi nhấn Enter
                            }
                          }}
                        />

                        <button onClick={() => handleIncrease(index)}>+</button>
                      </div>
                    </div>
                  </div>
                  {item.gift && (
                    <div className="user-cart-item gift">
                      <div className="user-cart-item-left">
                        <img
                          src={getImageUrl(item.gift?.image)}
                          alt={item.gift?.product_variant_id}
                          className="user-cart-item-image gift"
                        />
                        <div className="user-cart-item-info">
                          <div className="user-cart-item-name gift">
                            [Quà tặng] {item.gift?.name}
                          </div>
                          <div className="user-cart-item-brand gift">
                            {item.gift?.attribute_values
                              .map((attr) => `${attr.attribute_id}: ${attr.id}`)
                              .join(", ")}
                          </div>

                          <div className="user-cart-item-price">0₫</div>
                        </div>
                      </div>

                      <div className="user-cart-item-right gift">
                        <strong>
                          <FaGift size={18} />
                        </strong>
                        <div className="">Tặng 1</div>
                      </div>
                    </div>
                  )}
                </>
              ))}
            </div>
          ) : (
            <div className="user-cart-items-null">
              <img
                className="img-fluid"
                src="https://file.hstatic.net/200000259653/file/empty-cart_large_46db8e27ff56473ca63e3c4bb8981b64.png"
              />
            </div>
          )}
          {/* Ghi chú */}
          <div className="user-cart-note">
            <h3>Chính sách hoàn trả</h3>
            <div className="user-cart-return-policy">
              <p>
                ✅ <strong>Đổi trả dễ dàng trong vòng 7 ngày</strong> kể từ ngày
                nhận hàng đối với sản phẩm lỗi kỹ thuật, hư hỏng trong quá trình
                vận chuyển hoặc không đúng mô tả.
              </p>
              <p>
                🔄 <strong>Miễn phí 100% chi phí vận chuyển đổi trả</strong> nếu
                lỗi từ phía nhà bán. Chúng tôi sẽ hỗ trợ tối đa để bạn không
                phải lo lắng về rủi ro.
              </p>
              <p>
                💬 Vui lòng giữ sản phẩm ở tình trạng ban đầu, chưa qua sử dụng,
                đầy đủ tem mác và hóa đơn. Mọi yêu cầu hỗ trợ vui lòng liên hệ
                qua hotline <strong>0909 009 009</strong> hoặc gửi email về{" "}
                <strong>support@h2cosmetic.vn</strong>.
              </p>
              <p>
                🙌 Chúng tôi luôn đặt sự hài lòng của khách hàng lên hàng đầu.
                Cam kết hoàn tiền nhanh chóng và hỗ trợ tận tâm – vì bạn xứng
                đáng nhận được những trải nghiệm mua sắm tốt nhất!
              </p>
            </div>
          </div>
          <div className="user-cart-poster">
            <img src={"/image/2 (2).png"} alt="Poster" />
          </div>
        </div>

        <div className="user-cart-right">
          {/* Tổng & thanh toán */}
          <div className="user-cart-summary">
            <h3>Thông tin đơn hàng</h3>
            <div className="user-cart-total">
              <span>Tổng tiền:</span>
              <strong>{total.toLocaleString()}₫</strong>
            </div>
            <ul className="user-cart-promo">
              <li>
                ✅ Tất cả sản phẩm đều là hàng chính hãng 100%, nhập khẩu hoặc
                phân phối chính ngạch. Chúng tôi cam kết cung cấp đầy đủ hóa đơn
                VAT theo yêu cầu, giúp bạn hoàn toàn yên tâm khi mua sắm và sử
                dụng.
              </li>
              <li>
                💯 Nếu phát hiện bất kỳ sản phẩm nào là hàng giả, hàng nhái,
                hoặc không đúng mô tả, chúng tôi sẵn sàng hoàn tiền lên đến 200%
                giá trị đơn hàng. Uy tín và sự hài lòng của bạn là ưu tiên hàng
                đầu của chúng tôi!
              </li>
            </ul>
            <button
              className="user-cart-checkout-button"
              onClick={handleCheckout}
              disabled={itemsInCart.length === 0}
            >
              THANH TOÁN
            </button>

          </div>

          {/* Chính sách mua hàng */}
          <div className="user-cart-policy">
            Hiện chúng tôi chỉ hỗ trợ thanh toán qua hai phương thức{" "}
            <strong>Chuyển khoản ngân hàng</strong> và <strong>PayPall</strong>.
          </div>

          {/* Khuyến mãi */}
          <div className="user-cart-banner">
            🎉 Xem sản phẩm chất lượng cao cùng với ưu đãi hấp dẫn trong ngày
            tại <Link to="/">Trang chủ</Link> ngay nào !!!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
