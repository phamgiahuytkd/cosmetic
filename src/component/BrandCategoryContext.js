// src/component/context/BrandCategoryContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../service/api";

const BrandCategoryContext = createContext();

export const BrandCategoryProvider = ({ children }) => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandRes, categoryRes] = await Promise.all([
          api.get("/brand"),
          api.get("/category"),
        ]);
        setBrands(brandRes.data.result || []);
        setCategories(categoryRes.data.result || []);
      } catch (error) {
        console.error("Lỗi khi tải brands hoặc categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <BrandCategoryContext.Provider value={{ brands, categories, loading }}>
      {children}
    </BrandCategoryContext.Provider>
  );
};

export const useBrandCategory = () => useContext(BrandCategoryContext);
