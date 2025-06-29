import React, { useState, useEffect } from "react";
import "../../css/user/UserCart.css";
import { MdDeleteForever } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../component/user/CartContext";
import { getImageUrl } from "./component/imageUtils";
import api from "../../service/api";

const UserCart = () => {
  const {
    cartItems,
    cartCount,
    cartTotal,
    cartIds,
    fetchCart,
  } = useCart();

  const [itemsInCart, setItemsInCart] = useState([{}]);
  const [updatedIndex, setUpdatedIndex] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    setItemsInCart(cartItems);
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
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa "${item.name}" khỏi giỏ hàng không?`
    );

    if (confirmDelete) {
      api
        .delete(`/cart/${item.id}`) // Xóa dựa theo ID
        .then(() => {
          const updatedItems = itemsInCart.filter((_, i) => i !== index); // Xóa khỏi UI
          setItemsInCart(updatedItems);
          alert("Đã xóa sản phẩm khỏi giỏ hàng!");
          fetchCart();
        })
        .catch((err) => {
          console.error("Lỗi khi xóa sản phẩm:", err.response?.data?.message);
          alert("Xóa sản phẩm thất bại!");
        });
    }
  };


  const handleIncrease = (index) => {
    const updatedItems = [...itemsInCart];
    updatedItems[index].quantity += 1;
    setItemsInCart(updatedItems);
    setUpdatedIndex(index);
  };

  const handleDecrease = (index) => {
    const updatedItems = [...itemsInCart];
    if (updatedItems[index].quantity > 1) {
      updatedItems[index].quantity -= 1;
      setItemsInCart(updatedItems);
      setUpdatedIndex(index);
    }
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
          <div className="user-cart-items">
            {itemsInCart.map((item, index) => (
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
                    // onClick={() => removeItem(item.id)}
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
                    <div className="user-cart-item-brand">{item.brand}</div>
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
                      value={item.quantity} // Thay đổi defaultValue -> value

                    
                    />
                    <button onClick={() => handleIncrease(index)}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="user-cart-right">
          <div className="user-cart-summary">
            <h3>Thông tin đơn hàng</h3>
            <div className="user-cart-total">
              <span>Tổng tiền:</span>
              <strong>{total.toLocaleString()}₫</strong>
            </div>
            <button className="user-cart-checkout-button">THANH TOÁN</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCart;
