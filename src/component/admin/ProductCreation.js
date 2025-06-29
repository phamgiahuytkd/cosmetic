import React, { useEffect, useState } from "react";
import "../../css/admin/ProductCreation.css"; // Thêm file CSS để styling
import api from "../../service/api";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";


function ProductCreation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    brand: "",
    category: "", // Mã màu mặc định (trắng)
    description: "",
    image: "", // Không sử dụng giá trị mặc định cho ảnh, dùng file được chọn
    stock: 1,
    colourError: "", // Lưu lỗi nếu mã màu không hợp lệ
    isInStock: 1, // Mặc định sản phẩm có sẵn
  });

  const [imagePreview, setImagePreview] = useState(null); // Trạng thái cho ảnh xem trước

  // Mảng chứa category
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api.get('/category').then(response => { 
      setCategories(response.data.result);
    })
    .catch(error => {
        console.error(error.response.data.message);
    });
  }, []);

  // Mảng chứa category
  const [brands, setBrands] = useState([]);
  useEffect(() => {
    api.get('/brand').then(response => { 
      setBrands(response.data.result);
    })
    .catch(error => {
        console.error(error.response.data.message);
    });
  }, []);


  const handleInputChange = (e) => {
    if (typeof e === "object" && e.target) {
      // Trường hợp input thông thường
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    } else {
      // Trường hợp của ReactQuill
      setFormData({ ...formData, description: e });
    }
  };
  

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Lấy file đầu tiên
    setFormData({
      ...formData,
      image: file, // Cập nhật giá trị ảnh với file người dùng chọn
    });

    // Tạo URL cho ảnh xem trước
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImagePreview(imageURL); // Cập nhật URL ảnh xem trước
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
  
    if (!formData.name || !formData.price || !formData.image) {
      alert("Vui lòng điền đầy đủ thông tin sản phẩm và chọn hình ảnh.");
      return;
    }

    if(formData.category === ""){
      alert("Vui lòng chọn danh mục.");
      return;
    }

    if(formData.brand === ""){
      alert("Vui lòng chọn thương hiệu.");
      return;
    }

    const cleanDescription = formData.description.replace(/<[^>]*>/g, "").trim();
    if (!cleanDescription) {
      alert("Vui lòng nhập mô tả sản phẩm hợp lệ.");
      return;
    }

  
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("name", formData.name);
    formDataToSubmit.append("price", formData.price);
    formDataToSubmit.append("brand", formData.brand);
    formDataToSubmit.append("category", formData.category);
    formDataToSubmit.append("description", formData.description);
    formDataToSubmit.append("stock", formData.isInStock);
    formDataToSubmit.append("isInStock", formData.isInStock);
    if (formData.image) {
      formDataToSubmit.append("image", formData.image); // Chắc chắn rằng tệp đã được chọn
    }
  
    api
      .post("/product", formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data", // Đảm bảo kiểu nội dung là multipart/form-data
        },
      })
      .then((response) => {
        alert("Sản phẩm đã được thêm thành công!");
        navigate("/admin/product");
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  };

  return (
    <div className="product-creation-container">
      
      <form onSubmit={handleFormSubmit} className="product-creation-form">
        <h1>THÊM SẢN PHẨM</h1>
        <div>
          <label>Tên sản phẩm:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        <div>
          <label>Giá:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Nhập giá sản phẩm"
            required
          />
        </div>


        <div className="color-selection-container">
          <label>Thương hiệu:</label>
          <select
            name="brand"
            onChange={handleInputChange}
          >
            <option value="" style={{ backgroundColor: "#FFFFFF" }}>Chọn thương hiệu</option>
            {brands.map((brand, index) => (
              <option key={index} value={brand.id}>
                {brand.id}
              </option>
            ))}
          </select>
        </div>

        <div className="color-selection-container">
          <label>Danh mục:</label>
          <select
            name="category"
            onChange={handleInputChange}
          >
            <option value="" style={{ backgroundColor: "#FFFFFF" }}>Chọn danh mục</option>
            {categories.map((category, index) => (
              <option key={index} value={category.id}>
                {category.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Mô tả:</label>
          <ReactQuill
            value={formData.description}
            onChange={handleInputChange} // Trực tiếp truyền giá trị mà không cần đối tượng `name`
          />

        </div>

        <div>
          <label>Hình ảnh:</label>
          <div className="file-upload-container">
            <input
              type="file"
              id="file-input"
              name="image"
              onChange={handleFileChange} // Xử lý sự kiện thay đổi file
              className="file-input"
            />
            <label htmlFor="file-input" className="custom-file-label">
              Chọn ảnh
            </label>
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
            checked={formData.isInStock === 1}
            onChange={() => setFormData({
              ...formData,
              isInStock: formData.isInStock === 1 ? 0 : 1
            })}
          />
          <span>{formData.isInStock === 1 ? "Có" : "Không"}</span>
        </div>

        <div>
          <button type="submit">Thêm sản phẩm</button>
        </div>
      </form>
    </div>
  );
}

export default ProductCreation;
