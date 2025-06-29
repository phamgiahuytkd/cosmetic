import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import Swal from "sweetalert2";
import L from "leaflet";
import AddressSelector from "./AddressSelector";
import { InputGroup, InputGroupPhone } from "./InputComponent";
import AddressSuggestionInput from "./AddressSuggestionInput";
import "../css/UserAddAddressModal.css";

// Fix for Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const UserAddAddressModal = ({
  isOpen,
  onClose,
  onSave = () => {},
  enableErr = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    address_detail: "",
    locate: "",
  });
  const [errors, setErrors] = useState({});
  const [shouldValidate, setShouldValidate] = useState(enableErr);
  const mapRef = useRef(null);

  // Reset form khi modal mở
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        phone: "",
        address: "",
        address_detail: "",
        locate: "",
      });
      setErrors({});
      setShouldValidate(enableErr);
    }
  }, [isOpen, enableErr]);

  // Gọi API Geocoding với debounce khi address và address_detail thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchCoordinates = async () => {
        // Chỉ gọi API nếu có ít nhất một trong hai trường địa chỉ
        if (formData.address || formData.address_detail) {
          try {
            // Tạo các biến thể câu truy vấn
            const queries = [
              // Biến thể 1: Kết hợp cả hai trường
              formData.address && formData.address_detail
                ? `${formData.address_detail}, ${formData.address}`
                : null,
              // Biến thể 2: Chỉ address_detail
              formData.address_detail || null,
              // Biến thể 3: Chỉ address
              formData.address || null,
            ].filter(Boolean); // Loại bỏ các giá trị null

            let coordinatesFound = false;

            // Thử từng câu truy vấn
            for (const query of queries) {
              const encodedQuery = encodeURIComponent(query);
              const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&countrycodes=vn`
              );
              const data = await response.json();

              if (data.length > 0) {
                const { lat, lon } = data[0];
                const newLocate = `${lat}, ${lon}`;
                handleInputChange("locate", newLocate);
                coordinatesFound = true;
                break; // Thoát vòng lặp nếu tìm thấy tọa độ
              }
            }

            if (!coordinatesFound) {
              Swal.fire({
                icon: "warning",
                title: "Không tìm thấy tọa độ",
                text: "Địa chỉ không xác định được tọa độ. Vui lòng kiểm tra lại hoặc chọn thủ công trên bản đồ.",
              });
              handleInputChange("locate", ""); // Xóa tọa độ nếu không tìm thấy
            }
          } catch (error) {
            console.error("Lỗi khi lấy tọa độ:", error);
            Swal.fire({
              icon: "error",
              title: "Lỗi",
              text: "Không thể lấy tọa độ từ địa chỉ. Vui lòng thử lại hoặc chọn thủ công trên bản đồ.",
            });
            handleInputChange("locate", "");
          }
        }
      };
      fetchCoordinates();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [formData.address, formData.address_detail]);




  const handleInputChange = (name, valueOrObj) => {
    setShouldValidate(true);
    let value, error;
    if (typeof valueOrObj === "object" && valueOrObj !== null) {
      ({ value, error } = valueOrObj);
    } else {
      value = valueOrObj;
      error = validateField(name, value);
    }

    if (name && typeof value !== "undefined") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateField = (name, value) => {
    if (!value || typeof value !== "string") {
      if (name === "name") return "Họ và tên không được để trống.";
      if (name === "phone") return "Số điện thoại không được để trống.";
      if (name === "address") return "Địa chỉ không được để trống.";
      if (name === "address_detail")
        return "Số nhà / Đường không được để trống.";
      return "";
    }

    switch (name) {
      case "name":
        if (value.length > 255) return "Họ và tên không được quá 255 ký tự.";
        return "";
      case "phone":
        if (!/^0\d{9,10}$/.test(value))
          return "Số điện thoại phải bắt đầu bằng 0 và có 10–11 số.";
        return "";
      case "address":
        return "";
      case "address_detail":
        if (value.length > 255)
          return "Ghi chú địa chỉ không được quá 255 ký tự.";
        return "";
      case "locate":
        if (value) {
          const coordinateRegex =
            /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
          if (!coordinateRegex.test(value))
            return "Tọa độ không hợp lệ (ví dụ: 21.0285, 105.8542).";
        }
        return "";
      default:
        return "";
    }
  };

  const isFormValid = (validate = false) => {
    const newErrors = {};
    Object.keys(formData).forEach((name) => {
      const error = validateField(name, formData[name]);
      if (error) newErrors[name] = error;
    });

    if (validate && Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return false;
    }
    return true;
  };

  const isMapEnabled = () => {
    return formData.address && formData.address_detail;
  };

  // Hàm hiển thị bản đồ lớn trong Swal
  const showLargeMap = () => {
    if (!isMapEnabled()) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng nhập địa chỉ",
        text: "Cần nhập đầy đủ Tỉnh/Huyện/Xã và Số nhà/Đường trước khi chọn tọa độ.",
      });
      return;
    }

    Swal.fire({
      title: "Chọn vị trí trên bản đồ",
      html: '<div id="large-map" style="height: 400px; width: 100%;"></div>',
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      didOpen: () => {
        const defaultPos = formData.locate
          ? formData.locate.split(",").map(Number)
          : [21.0285, 105.8542]; // Vị trí mặc định (Hà Nội)
        const map = L.map("large-map").setView(defaultPos, 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const marker = L.marker(defaultPos, { draggable: true }).addTo(map);
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          map.setView([pos.lat, pos.lng], 15);
        });

        Swal.getConfirmButton().onclick = () => {
          const pos = marker.getLatLng();
          const newLocate = `${pos.lat}, ${pos.lng}`;
          handleInputChange("locate", newLocate);
          Swal.close();
        };
      },
      width: "80%",
    });
  };

  // Component để cập nhật vị trí bản đồ nhỏ khi tọa độ thay đổi
  const MapUpdater = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      if (position && !isNaN(position[0]) && !isNaN(position[1])) {
        map.setView(position, 15);
      }
    }, [position, map]);
    return null;
  };

  const handleSave = () => {
    setShouldValidate(true);
    if (isFormValid(true)) {
      if (typeof onSave === "function") {
        onSave(formData);
        onClose();
      } else {
        console.error("onSave is not a function");
      }
    }
  };

  if (!isOpen) return null;

  // Parse tọa độ cho bản đồ nhỏ
  const position = formData.locate
    ? formData.locate.split(",").map(Number)
    : [21.0285, 105.8542]; // Vị trí mặc định

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Thêm địa chỉ mới"
      className="user-add-address-popup-modal"
      overlayClassName="user-add-address-popup-overlay">
      <div className="user-add-address-popup-container">
        <h2 className="user-add-address-popup-title">Thêm địa chỉ mới</h2>

        <div className="user-add-address-popup-form">
          <InputGroup
            name="name"
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            value={formData.name}
            onChange={handleInputChange}
            errors={errors}
          />
          <InputGroupPhone
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            errors={errors}
          />
          <AddressSelector
            name="address"
            label="Địa chỉ"
            placeholder="Chọn tỉnh / huyện / xã"
            value={formData.address}
            onChange={handleInputChange}
            errors={errors}
          />
          <AddressSuggestionInput
            name="address_detail"
            label="Số nhà / Hẻm / Đường"
            placeholder="Nhập số nhà, tên đường, hẻm..."
            locationContext={formData?.address}
            value={formData.address_detail}
            onChange={handleInputChange}
            errors={errors}
          />
          <div className="form-group">
            <label>Tọa độ (nếu có)</label>
            <div
              style={{
                height: "200px",
                cursor: isMapEnabled() ? "pointer" : "not-allowed",
                opacity: isMapEnabled() ? 1 : 0.5,
              }}
              onClick={isMapEnabled() ? showLargeMap : null}
              title={
                isMapEnabled()
                  ? "Nhấp để chọn tọa độ"
                  : "Vui lòng nhập địa chỉ trước"
              }>
              <MapContainer
                center={position}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {formData.locate && <Marker position={position} />}
                <MapUpdater position={position} />
              </MapContainer>
            </div>
            {errors.locate && (
              <span className="user-add-address-popup-error-message">
                {errors.locate}
              </span>
            )}
          </div>
        </div>

        <div className="user-add-address-popup-actions">
          <button
            className="user-image-edit-popup-button save user-add-address-popup-button"
            onClick={handleSave}
            disabled={shouldValidate && !isFormValid()}>
            Lưu
          </button>
          <button
            className="user-image-edit-popup-button cancel user-add-address-popup-button"
            onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UserAddAddressModal;
