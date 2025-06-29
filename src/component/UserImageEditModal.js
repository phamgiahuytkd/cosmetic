import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";
import "../css/UserImageEditModal.css";

const UserImageEditModal = ({ isOpen, onClose, onSave, initialImage }) => {
  const [imageSrc, setImageSrc] = useState(initialImage || null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Thêm useEffect để cập nhật imageSrc khi initialImage thay đổi
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
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onSave(croppedImage);
      onClose();
    } catch (err) {
      console.error("Lỗi khi crop ảnh:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="user-image-edit-popup-overlay">
      <div className="user-image-edit-popup-modal">
        <h2 className="user-image-edit-popup-title">Chỉnh sửa ảnh đại diện</h2>

        <div className="user-image-edit-popup-crop-container">
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
            <span style={{ color: "#9ca3af" }}>Chưa có ảnh được chọn</span>
          )}
        </div>

        {/* Zoom range */}
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          disabled={!imageSrc}
          style={{
            width: "100%",
            margin: "1rem 0",
            opacity: imageSrc ? 1 : 0.5,
            cursor: imageSrc ? "pointer" : "not-allowed",
          }}
        />

        {/* Hidden file input + visible label */}
        <input
          id="user-image-file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="user-image-edit-file-input"
        />
        <label
          htmlFor="user-image-file-input"
          className="user-image-edit-file-label">
          {imageSrc ? "Chọn ảnh khác" : "Chọn ảnh từ thiết bị"}
        </label>

        {/* Action buttons */}
        <div className="user-image-edit-popup-actions">
          <button
            className="user-image-edit-popup-button save"
            onClick={handleSave}>
            Lưu
          </button>
          <button
            className="user-image-edit-popup-button cancel"
            onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserImageEditModal;
