"use client";

import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import Swal from "sweetalert2";
import { getCroppedImg } from "../utils/cropImage";
import "../css/UserImageEditModal.css";

const UserImageEditModal = ({ isOpen, onClose, onSave, initialImage }) => {
  const [imageSrc, setImageSrc] = useState(initialImage || null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    setImageSrc(initialImage || null);
  }, [initialImage]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (!imageSrc) {
        Swal.fire({
          title: "Lỗi",
          text: "Vui lòng chọn một ảnh để lưu",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
        return;
      }

      // getCroppedImg có thể trả Blob hoặc base64 (tùy bản utils).
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Nếu returned value là Blob -> convert sang base64
      let croppedBase64;
      if (cropped instanceof Blob) {
        croppedBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(cropped);
        });
      } else if (
        typeof cropped === "string" &&
        cropped.startsWith("data:image")
      ) {
        // already base64
        croppedBase64 = cropped;
      } else {
        // fallback: try to coerce to dataURL if possible
        // but usually cropped will be blob or dataURL; if not -> throw
        throw new Error("Unsupported cropped image format");
      }

      onSave(croppedBase64); // trả về chuỗi base64 cho parent
      onClose();
    } catch (err) {
      console.error("Lỗi khi crop ảnh:", err);
      Swal.fire({
        title: "Lỗi",
        text: "Không thể crop ảnh. Vui lòng thử lại.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="user-image-modal-overlay">
      <div className="user-image-modal-modal">
        <h2 className="user-image-modal-title">Chỉnh sửa ảnh đại diện</h2>

        <div className="user-image-modal-crop-container">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : (
            <span className="text-gray-400 flex items-center justify-center h-full">
              Chưa có ảnh được chọn
            </span>
          )}
        </div>

        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          disabled={!imageSrc}
          style={{ width: "100%", marginBottom: "1rem" }}
        />

        <input
          id="user-image-modal-file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="user-image-modal-file-input"
        />
        <label
          htmlFor="user-image-modal-file-input"
          className="user-image-modal-file-label">
          {imageSrc ? "Chọn ảnh khác" : "Chọn ảnh từ thiết bị"}
        </label>

        <div className="user-image-modal-actions">
          <button className="user-image-modal-button cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="user-image-modal-button save"
            onClick={handleSave}
            disabled={!imageSrc}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserImageEditModal;
