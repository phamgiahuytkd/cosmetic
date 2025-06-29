import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../service/api";
import "../../css/admin/ProductCreation.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function ProductDetail() { // Lấy ID sản phẩm từ URL
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = location.state || {};


  const [product, setProduct] = useState({
    name: "",
    price: "",
    brand: "",
    category: "",
    description: "",
    image: "",
    stock: 1,
    isInStock: 1,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    // Lấy thông tin sản phẩm theo ID
    api.get(`/product/${id}`)
      .then(response => {
        const data = response.data.result;
        setProduct({
          name: data.name,
          price: data.price,
          brand: data.brand,
          category: data.category,
          description: data.description,
          image: data.image,
          stock: data.stock,
          isInStock: data.stock,
        });
        setImagePreview(`http://localhost:8080/iCommerce/images/${data.image}`);
      })
      .catch(error => {
        console.error("Lỗi khi tải sản phẩm:", error);
      });

    // Lấy danh sách thương hiệu & danh mục
    api.get('/category')
      .then(response => setCategories(response.data.result))
      .catch(error => console.error("Lỗi danh mục:", error));

    api.get('/brand')
      .then(response => setBrands(response.data.result))
      .catch(error => console.error("Lỗi thương hiệu:", error));
  }, [id]);

  const handleInputChange = (e) => {
    if (typeof e === "object" && e.target) {
      const { name, value } = e.target;
      setProduct({ ...product, [name]: value });
    } else {
      setProduct({ ...product, description: e });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct({ ...product, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();

    if (!product.name || !product.price || !product.category || !product.brand) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("brand", product.brand);
    formData.append("category", product.category);
    formData.append("description", product.description);
    formData.append("stock", product.isInStock);
    formData.append("isInStock", product.isInStock);

    if (typeof product.image !== "string") {
      formData.append("image", product.image);
    }

    api.put(`/product/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(() => {
      alert("Cập nhật sản phẩm thành công!");
      navigate("/admin/product");
    })
    .catch(error => {
      alert("Lỗi cập nhật:", error.response.message || "Không thể cập nhật.");
    });
  };

  return (
    <div className="product-creation-container">
      <form onSubmit={handleUpdateProduct} className="product-creation-form">
        <h1>CHI TIẾT SẢN PHẨM</h1>
        
        <div>
          <label>Tên sản phẩm:</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Giá:</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="color-selection-container">
          <label>Thương hiệu:</label>
          <select name="brand" value={product.brand} onChange={handleInputChange}>
            <option value="">Chọn thương hiệu</option>
            {brands.map((brand, index) => (
              <option key={index} value={brand.id}>{brand.id}</option>
            ))}
          </select>
        </div>

        <div className="color-selection-container">
          <label>Danh mục:</label>
          <select name="category" value={product.category} onChange={handleInputChange}>
            <option value="">Chọn danh mục</option>
            {categories.map((category, index) => (
              <option key={index} value={category.id}>{category.id}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Mô tả:</label>
          <ReactQuill value={product.description} onChange={handleInputChange} />
        </div>

        <div>
          <label>Hình ảnh:</label>
          <div className="file-upload-container">
            <input
              type="file"
              id="file-input"
              name="image"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="file-input" className="custom-file-label">Chọn ảnh mới</label>
          </div>
          {imagePreview && (
            <div className="image-preview-container">
              <h4>Xem trước hình ảnh:</h4>
              <img src={imagePreview} alt="Preview" className="image-preview" />
            </div>
          )}
        </div>

        <div className="checkbox-selection-container">
          <label>Còn hàng:</label>
          <input
            type="checkbox"
            name="isInStock"
            checked={product.isInStock === 1}
            onChange={() =>
              setProduct({ ...product, isInStock: product.isInStock === 1 ? 0 : 1 })
            }
          />
          <span>{product.isInStock === 1 ? "Có" : "Không"}</span>
        </div>

        <div>
          <button type="submit">Cập nhật sản phẩm</button>
        </div>
      </form>
    </div>
  );
}

export default ProductDetail;
