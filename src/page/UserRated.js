import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import ReactStars from "react-rating-stars-component";
import Swal from "sweetalert2";
import api from "../service/api";
import "../css/UserRated.css";
import { getImageUrl } from "../component/commonFunc";

Modal.setAppElement("#root");

const UserRated = () => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    api
      .get("/rating/product-rated")
      .then((res) => {
        console.log(res.data.result);
        setRatings(res.data.result);
      })
      .catch((err) => {
        console.error(
          err.response?.data?.message ||
            "Lỗi lấy thông tin sản phẩm cần đánh giá"
        );
      });
  }, []);

  const openModal = (ratingData) => {
    setSelectedRating(ratingData);
    setRating(ratingData.star || 0);
    setContent(ratingData.comment || "");
    setImages(
      ratingData.images
        ? ratingData.images.split(",").map((url) => ({ url }))
        : []
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRating(null);
    setRating(0);
    setContent("");
    setImages([]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      Swal.fire({
        icon: "warning",
        title: "Tối đa 5 ảnh!",
      });
      return;
    }
    setImages([...images, ...files.map((file) => ({ file }))]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleUpdate = () => {
    if (rating === 0 || !content.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng chọn số sao và nhập nội dung đánh giá",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("id", selectedRating.id);
    formData.append("star", rating);
    formData.append("comment", content);
    images.forEach((img, idx) => {
      if (img.file) {
        formData.append(`images`, img.file);
      } else if (img.url) {
        formData.append(`existingImages[${idx}]`, img.url);
      }
    });

    api
      .put("/rating", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        Swal.fire({ icon: "success", title: "Cập nhật đánh giá thành công!" });
        setRatings((prev) =>
          prev.map((r) =>
            r.id === selectedRating.id
              ? {
                  ...r,
                  star: rating,
                  comment: content,
                  images: images
                    .map((img) => img.url || URL.createObjectURL(img.file))
                    .join(","),
                }
              : r
          )
        );
        closeModal();
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: err.response?.data?.message || "Không thể cập nhật đánh giá",
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="user-rated-container">
      <h2 className="user-rated-title">Đánh giá của bạn</h2>

      {ratings.length === 0 ? (
        <p className="user-rated-empty">Bạn chưa đánh giá sản phẩm nào 😢</p>
      ) : (
        <div className="user-rated-list">
          {ratings.map((r, index) => (
            <div className="user-rated-item" key={index}>
              <div className="user-rated-display">
                <img
                  src={getImageUrl(r?.image)}
                  alt={r?.id}
                  className="user-rated-image"
                />
                <div className="user-rated-info">
                  <p className="user-rated-name">{r?.name}</p>
                  <p className="user-rated-variant">
                    {r?.attribute_values
                      .map((attr) => `${attr.attribute_id}: ${attr.id}`)
                      .join(", ")}
                  </p>
                  <div className="user-rated-stars">
                    <ReactStars
                      count={5}
                      value={r.star}
                      edit={false}
                      size={25}
                      activeColor="#fadb14"
                    />
                  </div>
                </div>
              </div>
              <p className="user-rated-comment">
                <em>{r.comment}</em>
              </p>
              <p className="user-rated-date">
                {(() => {
                  const date = new Date(r?.create_day);
                  return `${date.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })} - ${date.toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}`;
                })()}
              </p>

              {r.images && r.images.trim().length > 0 && (
                <div className="user-product-detail-review-images">
                  {r.images.split(",").map((image, index) => (
                    <img
                      key={index}
                      src={getImageUrl(image.trim())}
                      alt={`Ảnh bình luận ${index + 1}`}
                      className="user-product-detail-review-image"
                    />
                  ))}
                </div>
              )}

              {/* <button
                className="user-rated-button"
                onClick={() => openModal(r)}>
                Cập nhật
              </button> */}
            </div>
          ))}
        </div>
      )}

      <UpdateRatingModal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={selectedRating}
        rating={rating}
        setRating={setRating}
        content={content}
        setContent={setContent}
        images={images}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        onSubmit={handleUpdate}
        loading={loading}
      />
    </div>
  );
};

const UpdateRatingModal = ({
  isOpen,
  onClose,
  product,
  rating,
  setRating,
  content,
  setContent,
  images,
  handleImageUpload,
  removeImage,
  onSubmit,
  loading,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Cập nhật đánh giá"
      className="user-rated-modal"
      overlayClassName="user-rated-overlay"
      closeTimeoutMS={300}>
      <div className="user-rated-modal-content">
        <h3>Cập nhật đánh giá</h3>

        <div className="user-rated-modal-info">
          <img
            src={getImageUrl(product?.image)}
            alt={product?.name}
            className="user-rated-image"
          />
          <div>
            <p className="user-rated-product-name">{product?.name}</p>
            <p className="user-rated-product-variant">
              {product.attribute_values
                .map((attr) => `${attr.attribute_id}: ${attr.id}`)
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
          className="user-rated-textarea"
          placeholder="Chỉnh sửa cảm nhận của bạn..."
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div
          className="user-rated-dropzone"
          onClick={() => document.getElementById("image-upload-input").click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleImageUpload({ target: { files: e.dataTransfer.files } });
          }}>
          <span className="user-rated-dropzone-text">
            📷 Thêm ảnh (tối đa 5)
          </span>
          <input
            type="file"
            id="image-upload-input"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="user-rated-image-input-hidden"
          />
        </div>

        <div className="user-rated-image-preview">
          {images.map((img, idx) => (
            <div key={idx} className="user-rated-preview-wrapper">
              <img
                src={
                  img.url ? getImageUrl(img.url) : URL.createObjectURL(img.file)
                }
                alt={`preview-${idx}`}
                className="user-rated-preview-img"
              />
              <button
                className="user-rated-remove-image"
                onClick={() => removeImage(idx)}>
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="user-rated-actions">
          <button
            className="user-rated-submit"
            onClick={onSubmit}
            disabled={loading}>
            {loading ? "Đang gửi..." : "Cập nhật"}
          </button>
          <button className="user-rated-cancel" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UserRated;
