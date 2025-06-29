// src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../service/api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy role trực tiếp ở đây
  const token = localStorage.getItem("token");
  let role = null;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      role = decodedToken.scope;
    } catch (error) {
      console.error("Token không hợp lệ:", error);
    }
  }

  const fetchUser = async () => {
    if (role === "USER") {
      try {
        const res = await api.get("/user/logged");
        setUser(res.data.result); // gộp role vào user luôn
      } catch (err) {
        console.error("Lỗi lấy thông tin người dùng:", err);
      } finally {
        setLoading(false);
      }
    } else {
      // Nếu không phải role "user", không gọi API
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
