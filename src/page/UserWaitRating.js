import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import ReactStars from "react-rating-stars-component";
import Swal from "sweetalert2";
import api from "../service/api";
import "../css/UserWaitRating.css";
import { getImageUrl } from "../component/commonFunc";

Modal.setAppElement("#root");

const UserWaitRating = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get("/rating/product-to-rate")
      .then((res) => {
        setProducts(res.data.result);
        console.log(res.data.result);
      })
      .catch((err) => {
        console.error(
          err.response?.data?.message ||
          "Lỗi lấy thông tin sản phẩm cần đánh giá"
        );
      });
  }, []);

  const openModal = (product) => {
    setSelectedProduct(product);
    setRating(0);
    setContent("");
    setImages([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const total = images.length + files.length;

    if (total > 5) {
      Swal.fire({
        icon: "warning",
        title: "Chỉ được chọn tối đa 5 ảnh",
      });
      return;
    }

    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (rating === 0 || !content.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng chọn số sao và nhập nội dung đánh giá",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("product_variant_id", selectedProduct.id);
    formData.append("order_id", selectedProduct.order_id);
    formData.append("star", rating);
    formData.append("comment", content);

    // ✅ Gửi ảnh
    images.forEach((img) => {
      formData.append("images", img);
    });

    // Log ra để chắc chắn ảnh có trong FormData
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    api
      .post("/rating", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Đánh giá thành công!",
        });
        closeModal();
        setProducts((prev) =>
          prev.filter(
            (p) =>
              p.id !== selectedProduct.id ||
              p.order_id !== selectedProduct.order_id
          )
        );
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: err.response?.data?.message || "Không thể gửi đánh giá",
        });
      })
      .finally(() => setLoading(false));
  };



  return (
    <div className="user-wait-rating-container">
      <h2 className="user-wait-rating-title">Sản phẩm chờ đánh giá</h2>

      {products.length === 0 && (
        <p className="user-wait-rating-empty">
          Chưa có sản phẩm để đánh giá 😊 !!!
        </p>
      )}
      <div className="user-wait-rating-list">
        {products?.map((product) => (
          <div
            className="user-wait-rating-item"
            key={product?.id + product?.order_id}>
            <img
              src={getImageUrl(product?.image)}
              alt={product?.id}
              className="user-wait-rating-image"
            />
            <div className="user-wait-rating-info">
              <p className="user-wait-rating-name">{product?.name}</p>
              <p className="user-wait-rating-variant">
                {product?.attribute_values
                  ?.map((attr) => `${attr.attribute_id}: ${attr.id}`)
                  .join(", ")}
              </p>
              <button
                className="user-wait-rating-button"
                onClick={() => openModal(product)}>
                Đánh giá
              </button>
            </div>
          </div>
        ))}
      </div>

      <RatingModal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={selectedProduct}
        onSubmit={handleSubmit}
        loading={loading}
        rating={rating}
        setRating={setRating}
        content={content}
        setContent={setContent}
        images={images}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
      />
    </div>
  );
};

export default UserWaitRating;

// ────────────────────────────────────────
// 🔹 Tách Modal thành Component riêng ngay trong file
// ────────────────────────────────────────

const RatingModal = ({
  isOpen,
  onClose,
  product,
  onSubmit,
  loading,
  rating,
  setRating,
  content,
  setContent,
  images,
  handleImageUpload,
  removeImage,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Đánh giá sản phẩm"
      className="user-wait-rating-modal"
      overlayClassName="user-wait-rating-overlay"
      closeTimeoutMS={300}>
      <div className="user-wait-rating-modal-content">
        <h3>Đánh giá sản phẩm</h3>

        <div className="user-wait-rating-modal-info">
          <img
            src={getImageUrl(product?.image)}
            alt={product?.name}
            className="user-wait-rating-image"
          />
          <div>
            <p className="user-wait-rating-product-name">{product?.name}</p>
            <p className="user-wait-rating-product-variant">
              {product?.attribute_values
                ?.map((attr) => `${attr.attribute_id}: ${attr.id}`)
                .join(", ")}
            </p>
          </div>
        </div>

        <ReactStars
          count={5}
          value={rating}
          onChange={setRating}
          size={36}
          activeColor="#fadb14"
        />

        <textarea
          className="user-wait-rating-textarea"
          placeholder="Chia sẻ cảm nhận của bạn..."
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}></textarea>

        <div
          className="user-wait-rating-dropzone"
          onClick={() => document.getElementById("image-upload-input").click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleImageUpload({ target: { files: e.dataTransfer.files } });
          }}>
          <span className="user-wait-rating-dropzone-text">
            📷 Thêm ảnh (tối đa 5)
          </span>
          <input
            type="file"
            id="image-upload-input"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="user-wait-rating-image-input-hidden"
          />
        </div>

        <div className="user-wait-rating-image-preview">
          {images?.map((img, idx) => (
            <div key={idx} className="user-wait-rating-preview-wrapper">
              <img
                src={URL.createObjectURL(img)}
                alt={`preview-${idx}`}
                className="user-wait-rating-preview-img"
              />
              <button
                className="user-wait-rating-remove-image"
                onClick={() => removeImage(idx)}>
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="user-wait-rating-actions">
          <button
            className="user-wait-rating-submit"
            onClick={onSubmit}
            disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
          <button className="user-wait-rating-cancel" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </Modal>
  );
};
