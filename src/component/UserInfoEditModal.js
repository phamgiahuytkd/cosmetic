import React, { useState, useRef, useEffect } from "react";
import { format, parse } from "date-fns";
import "../css/UserInfoEditModal.css";
import { InputDateGroup, InputGroup, InputGroupPhone } from "./InputComponent";

const UserInfoEditModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    dob: initialData?.dob
      ? format(new Date(initialData.dob), "dd/MM/yyyy")
      : "",
    phone: initialData?.phone || "",
  });
  const [errors, setErrors] = useState({});
  const calendarRef = useRef();

  // Đồng bộ formData khi initialData thay đổi
  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      fullName: initialData?.fullName || "",
      dob: initialData?.dob
        ? format(new Date(initialData.dob), "dd/MM/yyyy")
        : "",
      phone: initialData?.phone || "",
    });
    setErrors({});
  }, [initialData, isOpen]);

  // Xử lý thay đổi input
  const handleInputChange = (name, valueOrObj) => {
    let value, error;
    if (typeof valueOrObj === "object" && valueOrObj !== null) {
      // InputDateGroup trả về { value, error }
      ({ value, error } = valueOrObj);
    } else {
      // InputGroup và InputGroupPhone trả về newValue
      value = valueOrObj;
      error = validateField(name, value);
    }

    if (name && typeof value !== "undefined") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Xác thực từng trường
  const validateField = (name, value) => {
    // Kiểm tra nếu value không phải chuỗi hoặc rỗng
    if (!value || typeof value !== "string") {
      if (name === "fullName") return "Họ và tên không được để trống.";
      if (name === "dob") return "Vui lòng nhập ngày sinh.";
      if (name === "phone") return "Số điện thoại không được để trống.";
      return "";
    }

    switch (name) {
      case "fullName":
        if (value.length > 255) return "Họ và tên không được quá 255 ký tự.";
        return "";
      case "dob":
        const parsed = parse(value, "dd/MM/yyyy", new Date());
        if (isNaN(parsed) || parsed > new Date())
          return "Ngày sinh không hợp lệ.";
        return "";
      case "phone":
        if (!/^0\d{9,10}$/.test(value))
          return "Số điện thoại phải bắt đầu bằng 0 và có 10–11 số.";
        return "";
      default:
        return "";
    }
  };

  // Kiểm tra xem form có hợp lệ không
  const isFormValid = () => {
    // Kiểm tra lỗi hiện tại trong state
    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) return false;

    // Xác thực lại tất cả các trường để đảm bảo không có lỗi mới
    const newErrors = {};
    Object.keys(formData).forEach((name) => {
      const error = validateField(name, formData[name]);
      if (error) newErrors[name] = error;
    });

    // Cập nhật errors nếu có lỗi mới
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return false;
    }

    return true;
  };

  // Xử lý lưu
  const handleSave = () => {
    if (isFormValid()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="user-info-popup-overlay">
      <div className="user-info-popup-modal">
        <h2 className="user-info-popup-title">Chỉnh sửa thông tin</h2>

        <InputGroup
          name="fullName"
          label="Họ và tên"
          placeholder="Nhập họ và tên"
          value={formData.fullName}
          onChange={handleInputChange}
          errors={errors}
        />

        <InputDateGroup
          name="dob"
          label="Ngày sinh"
          placeholder="Nhập ngày sinh: dd/mm/yyyy"
          value={formData.dob}
          onChange={handleInputChange}
          errors={errors}
          ref={calendarRef}
        />

        <InputGroupPhone
          name="phone"
          placeholder="Nhập số điện thoại"
          value={formData.phone}
          onChange={handleInputChange}
          errors={errors}
        />

        <div className="user-info-popup-actions">
          <button onClick={handleSave} disabled={!isFormValid()}>
            Lưu
          </button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoEditModal;
