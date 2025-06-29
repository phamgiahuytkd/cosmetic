import React, { useEffect, useState } from "react";
import "../../css/admin/ProductAdmin.css";
import api from "../../service/api";
import SearchForm from "../SearchForm";
import { useNavigate } from "react-router-dom";

const ProductAdmin = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/product")
      .then((response) => {
        setProducts(response.data.result);
      })
      .catch((error) => {
        console.error(
          error.response?.data?.message || "Error fetching products"
        );
      });
  }, []);

  const handleAdd = () => navigate(`/admin/add-product`);
  const toggleFormVisibility = () => setIsFormVisible(!isFormVisible);
  const closeForm = () => setIsFormVisible(false);

  const handleStockChange = (productId, currentStock) => {
    const updatedStock = currentStock === 1 ? 0 : 1;
    api
      .put(`/product/${productId}`, { stock: updatedStock })
      .then(() => {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId
              ? { ...product, stock: updatedStock }
              : product
          )
        );
      })
      .catch((error) => {
        console.error("Lỗi cập nhật trạng thái sản phẩm:", error);
      });
  };

  const handleSearch = (searchData) => {
    const { name, brand, category, minPrice, maxPrice } = searchData;
    api
      .post("/product/search", {
        name: name,
        min_price: minPrice,
        max_price: maxPrice,
        brand_id: brand,
        category_id: category,
      })
      .then((response) => {
        setProducts(response.data.result);
      })
      .catch((error) => {
        console.error(
          error.response?.data?.message || "Error fetching products"
        );
      });
  };

  // Chuyển đến trang chi tiết sản phẩm
  const handleProductDetails = (productId) => {
    navigate(`/admin/details-product`, {
      state: {
        id: productId,
      },
    });
  };

  return (
    <div className="product-admin-container">
      <h1 className="product-admin-title">
        Quản lý sản phẩm
        <div>
          <button onClick={handleAdd}>+</button>
          <button onClick={toggleFormVisibility}>
            <i className="fas fa-search"></i>
          </button>
        </div>
      </h1>
      <table className="product-admin-table">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Thương hiệu</th>
            <th>Trạng thái</th>
            <th>Tùy chỉnh</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item) => (
            <tr key={item.id}>
              <td>
                <img
                  src={`http://localhost:8080/iCommerce/images/${item.image}`}
                  alt={item.name}
                  className="product-admin-image"
                />
              </td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.brand}</td>
              <td>
                <label className="product-admin-switch">
                  <input
                    type="checkbox"
                    checked={item.stock === 1}
                    onChange={() => handleStockChange(item.id, item.stock)}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="stock-status">
                  {item.stock === 1 ? "Còn hàng" : "Hết hàng"}
                </span>
              </td>
              <td>
                <button
                  className="product-admin-edit-button"
                  onClick={() => handleProductDetails(item.id)}>
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <SearchForm
        isVisible={isFormVisible}
        onClose={closeForm}
        onSubmit={handleSearch}
      />
    </div>
  );
};

export default ProductAdmin;
