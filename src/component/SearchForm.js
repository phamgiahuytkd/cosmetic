import React, { useEffect, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../css/SearchForm.css";
import api from "../service/api";

const SearchForm = ({ onSubmit, isVisible, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: null,
    brand: null,
    maxPrice: 0,
    minPrice: 0,
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [minMaxPrice, setMinMaxPrice] = useState([0, 1000]);

  useEffect(() => {
    api
      .get("/category")
      .then((res) => setCategories(res.data.result))
      .catch((err) => console.error(err));

    api
      .get("/brand")
      .then((res) => setBrands(res.data.result))
      .catch((err) => console.error(err));

    api
      .get("/product-variant/price-range")
      .then((res) => {
        const { minPrice, maxPrice } = res.data.result;
        setMinMaxPrice([minPrice || 0, maxPrice || 1000]);
        setFormData((prev) => ({
          ...prev,
          minPrice: minPrice || 0,
          maxPrice: maxPrice || 1000,
        }));
      })
      .catch((err) => console.error("Lỗi lấy dữ liệu giá", err));
  }, []);

  const handleSliderChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1],
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Chuyển "" thành null nếu cần
    const preparedData = {
      ...formData,
      brand: formData.brand === "" ? null : formData.brand,
      category: formData.category === "" ? null : formData.category,
      name: formData.name === "" ? null : formData.name,
    };

    if (onSubmit) {
      onSubmit(preparedData);
    }
  };

  return (
    <div className={`form-search-container ${isVisible ? "visible" : ""}`}>
      <button className="search-close-btn" onClick={onClose}>
        ×
      </button>
      <h3>Tìm kiếm sản phẩm</h3>
      <form onSubmit={handleFormSubmit} className="form-search">
        <div>
          <label>Tên sản phẩm:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập tên sản phẩm"
          />
        </div>

        <div>
          <label>Thương hiệu:</label>
          <select
            name="brand"
            value={formData.brand || ""}
            onChange={(e) =>
              setFormData({ ...formData, brand: e.target.value || null })
            }>
            <option value="">Chọn thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Danh mục:</label>
          <select
            name="category"
            value={formData.category || ""}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value || null })
            }>
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Khoảng giá:</label>
          <Slider
            range
            min={minMaxPrice[0]}
            max={minMaxPrice[1]}
            value={[formData.minPrice, formData.maxPrice]}
            onChange={handleSliderChange}
          />
          <div className="price-values">
            <span>{formData.minPrice} VNĐ</span> -{" "}
            <span>{formData.maxPrice} VNĐ</span>
          </div>
        </div>

        <button type="submit">Tìm kiếm</button>
      </form>
    </div>
  );
};

export default SearchForm;
