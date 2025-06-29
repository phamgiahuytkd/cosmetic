// src/context/FavoriteContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../service/api";
import { useUser } from "./UserContext";

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favoriteIdSet, setFavoriteIdSet] = useState(new Set()); // 👈 dùng Set
  const [openLoveModal, setOpenLoveModal] = useState(false);

  const { user } = useUser();

  const fetchFavorites = async () => {
    try {
      const res = await api.get("/product/loveproduct");
      const items = res.data.result || [];
      setFavoriteItems(items);
      setFavoriteCount(items.length);
      setFavoriteIdSet(new Set(items.map((item) => item.id))); // 👈 tạo Set id
    } catch (error) {
      console.error("Lỗi lấy danh sách yêu thích:", error);
    }
  };

  const toggleFavorite = async (productId) => {
    try {
      const isFav = favoriteIdSet.has(productId); // 👈 O(1) thay vì .some()

      if (isFav) {
        await api.delete(`/favorites/${productId}`);
      } else {
        await api.post(`/favorites`, { productId });
      }

      await fetchFavorites(); // cập nhật lại sau thay đổi
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu thích:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  return (
    <FavoriteContext.Provider
      value={{
        favoriteItems,
        favoriteCount,
        favoriteIdSet, // 👈 exposed để dùng ở component
        fetchFavorites,
        toggleFavorite,
        openLoveModal,
        setOpenLoveModal,
      }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoriteContext);
