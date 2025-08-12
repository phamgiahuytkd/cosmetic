// src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../service/api";
import { useUser } from "./UserContext"; // 👈 import user context

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartIds, setCartIds] = useState("");

  const { user } = useUser(); // 👈 lấy thông tin user

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      const items = res.data.result || [];
      setCartItems(items);


      let totalQuantity = 0;
      let totalAmount = 0;
      let ids = [];
      const uniqueProductIds = new Set();

      for (const item of items) {
        totalQuantity += item.quantity;
        if (item.gift) {
          totalQuantity += 1;
        }
        totalAmount += item.quantity * item.price;
        ids.push(item.id);
        uniqueProductIds.add(item.product_id);
      }

      setCartCount(totalQuantity);
      setCartTotal(totalAmount);
      setCartIds(ids.join(","));
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
    }
  };

  // Chỉ fetchCart khi có user
  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]); // 👈 chạy lại khi user thay đổi

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        cartIds,
        fetchCart,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
