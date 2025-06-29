import React, { useState } from "react";
import "../../css/admin/AddColorOption.css";
import api from "../../service/api";

function AddColorOption({ selectedProduct, onAddColor, isFormVisible, setIsFormVisible, initialName, initialBrand }) {
  const [newColor, setNewColor] = useState("");
  const [newPrice, setNewPrice] = useState(selectedProduct.price);
  const [newStock, setNewStock] = useState(1);
  const [newImage, setNewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Danh sách các màu sắc với mã hex
  const colorOptions = [
    "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#9B59B6", "#1ABC9C",
    "#E74C3C", "#3498DB", "#2ECC71", "#34495E", "#95A5A6", "#F39C12"
  ];

  const handleAddColor = () => {
    if (!newColor) {
      alert("Vui lòng chọn màu sắc.");
      return;
    }

    if (newPrice < 0) {
      alert("Giá không thể âm.");
      return;
    }

    const newProduct = {
      ...selectedProduct,
      colour: newColor,
      price: newPrice,
      stock: newStock,
    };

    // Tạo formData để gửi ảnh lên nếu có
    const formData = new FormData();

    formData.append("name", initialName);
    formData.append("price", newProduct.price);
    formData.append("brand", initialBrand);
    formData.append("colour", newProduct.colour);
    formData.append("stock", newProduct.stock);
    formData.append("isInStock", newProduct.isInStock);

    if (newImage) {
      formData.append("image", newImage);
    }else{
        alert("Vui lòng chọn ảnh");
    }

    api
        .post("/products/colors", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((response) => {
        alert("Màu mới đã được thêm!");
        window.location.reload(); 
      })
      .catch((error) => {
        console.error("Lỗi khi thêm màu:", error);
        alert("Có lỗi xảy ra khi thêm màu.");
      });

  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file));
      console.log(file);
    }
  };

  return (
    <div className={`add-color-option-container ${isFormVisible ? 'show' : ''}`}>
      <div className="add-color-option">
      <h3>
        <span>Thêm màu mới</span>
        <button 
            onClick={() => {
                setIsFormVisible(false);  // Xóa ảnh xem trước
              }} 
            
        >
            &times;
        </button>
        </h3>

        <label>
          <strong>Màu sắc:</strong>
          <select
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            style={{ backgroundColor: newColor || '#fff' }}
          >
            <option value=""
            style={{ backgroundColor: '#fff' }}
            >Chọn màu</option>
            {colorOptions.map((color, index) => (
              <option key={index} value={color} style={{ backgroundColor: color }}>
                {color}
              </option>
            ))}
          </select>
        </label>
        <label>
          <strong>Giá:</strong>
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(Math.max(0, e.target.value))}
          />
        </label>
        <label>
          <strong>Trạng thái:</strong>
          <input
            type="checkbox"
            checked={newStock === 1}
            onChange={() => setNewStock(newStock === 1 ? 0 : 1)}
          />
          {newStock === 1 ? " Còn hàng" : " Hết hàng"}
        </label>
        <label className="add-color-image">
          <span>Thêm ảnh</span>
          <input
            type="file"
            onChange={handleImageChange}
          />
          {previewImage && (
            <div className="image-preview">
              <img src={previewImage} alt="Preview" className="preview-img" />
            </div>
          )}
        </label>
        <button onClick={handleAddColor} className="add-color-button">
          Thêm màu mới
        </button>
      </div>
    </div>
  );
}

export default AddColorOption;
