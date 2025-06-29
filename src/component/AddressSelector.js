import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { getProvinces, getDistricts, getWards } from "vietnam-provinces";
import "../css/AddressSelector.css";

const AddressSelector = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  errors = {},
  disabled = false,
}) => {
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const [address, setAddress] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState("province");

  const wrapperRef = useRef(null);
  const isUserInteraction = useRef(false); // Theo dõi thay đổi do người dùng

  // Tải danh sách Tỉnh/TP
  useEffect(() => {
    const provinces = getProvinces().map((p) => ({
      value: p.code,
      label: p.name,
    }));
    setProvinceOptions(provinces);
  }, []);

  // Khi chọn Tỉnh/TP → load Quận/Huyện
  useEffect(() => {
    if (selectedProvince) {
      const districts = getDistricts()
        .filter((d) => d.province_code === selectedProvince.value)
        .map((d) => ({ value: d.code, label: d.name }));
      setDistrictOptions(districts);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setCurrentLevel("district");
    } else {
      setDistrictOptions([]);
      setWardOptions([]);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setCurrentLevel("province");
    }
  }, [selectedProvince]);

  // Khi chọn Quận/Huyện → load Phường/Xã
  useEffect(() => {
    if (selectedDistrict) {
      const wards = getWards()
        .filter((w) => w.district_code === selectedDistrict.value)
        .map((w) => ({ value: w.code, label: w.name }));
      setWardOptions(wards);
      setSelectedWard(null);
      setCurrentLevel("ward");
    } else {
      setWardOptions([]);
      setSelectedWard(null);
      if (selectedProvince) setCurrentLevel("district");
      else setCurrentLevel("province");
    }
  }, [selectedDistrict]);

  // Đồng bộ giá trị ban đầu từ prop value, không kích hoạt onChange
  useEffect(() => {
    if (value && value.split(",").length === 3) {
      setAddress(value);
    } else {
      setAddress("");
    }
  }, [value]);

  // Cập nhật địa chỉ đầy đủ khi chọn xong, chỉ gọi onChange nếu do người dùng
  useEffect(() => {
    const parts = [];
    if (selectedWard) parts.push(selectedWard.label);
    if (selectedDistrict) parts.push(selectedDistrict.label);
    if (selectedProvince) parts.push(selectedProvince.label);

    const fullAddress = parts.length === 3 ? parts.reverse().join(", ") : "";

    if (fullAddress !== address) {
      setAddress(fullAddress);
      if (isUserInteraction.current && onChange) {
        onChange(name, fullAddress);
      }
    }
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard,
    name,
    onChange,
    address,
  ]);
  

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        isUserInteraction.current = true; // Đánh dấu là tương tác người dùng
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    if (disabled) return;
    setIsOpen(true);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setAddress("");
    setCurrentLevel("province");
    isUserInteraction.current = true; // Đánh dấu là tương tác người dùng
    if (onChange) onChange(name, "");
  };

  const handleChange = (value) => {
    isUserInteraction.current = true; // Đánh dấu là tương tác người dùng
    if (currentLevel === "province") setSelectedProvince(value);
    else if (currentLevel === "district") setSelectedDistrict(value);
    else if (currentLevel === "ward") {
      setSelectedWard(value);
      if (value) setIsOpen(false);
    }
  };

  return (
    <div
      className={`user-checkout-input-group ${
        disabled ? "user-checkout-input-group--disabled" : ""
      }`}
      ref={wrapperRef}>
      <div
        className={`user-checkout-input-wrapper ${
          address ? "user-checkout-input-wrapper--filled" : ""
        }`}>
        <label className="user-checkout-input-label" htmlFor={name}>
          {label}
        </label>
        <input
          className="user-checkout-input-field"
          name={name}
          type="text"
          placeholder={placeholder}
          value={address}
          onFocus={handleInputFocus}
          readOnly
          disabled={disabled}
          autoComplete={name}
        />
      </div>

      {isOpen && (
        <div className="user-checkout-address-dropdown active fade-slide">
          <div className="user-checkout-address-tabs">
            <div
              className={`user-checkout-address-tab ${
                currentLevel === "province" ? "active" : ""
              }`}>
              Tỉnh/TP
            </div>
            <div
              className={`user-checkout-address-tab ${
                currentLevel === "district" ? "active" : ""
              }`}>
              Quận/Huyện
            </div>
            <div
              className={`user-checkout-address-tab ${
                currentLevel === "ward" ? "active" : ""
              }`}>
              Phường/Xã
            </div>
          </div>

          <div className="user-checkout-address-select-wrapper">
            <div
              className={`fade-slide ${
                currentLevel === "province" ? "show" : ""
              }`}
              style={{
                display: currentLevel === "province" ? "block" : "none",
              }}>
              <Select
                className="user-checkout-address-select"
                classNamePrefix="user-checkout-address-select"
                options={provinceOptions}
                value={selectedProvince}
                onChange={handleChange}
                placeholder="Chọn Tỉnh/TP..."
                isClearable
                blurInputOnSelect={false}
                tabSelectsValue={false}
                maxMenuHeight={240}
                menuIsOpen
              />
            </div>

            <div
              className={`fade-slide ${
                currentLevel === "district" ? "show" : ""
              }`}
              style={{
                display: currentLevel === "district" ? "block" : "none",
              }}>
              <Select
                className="user-checkout-address-select"
                classNamePrefix="user-checkout-address-select"
                options={districtOptions}
                value={selectedDistrict}
                onChange={handleChange}
                placeholder="Chọn Quận/Huyện..."
                isClearable
                blurInputOnSelect={false}
                tabSelectsValue={false}
                maxMenuHeight={240}
                menuIsOpen
              />
            </div>

            <div
              className={`fade-slide ${currentLevel === "ward" ? "show" : ""}`}
              style={{ display: currentLevel === "ward" ? "block" : "none" }}>
              <Select
                className="user-checkout-address-select"
                classNamePrefix="user-checkout-address-select"
                options={wardOptions}
                value={selectedWard}
                onChange={handleChange}
                placeholder="Chọn Phường/Xã..."
                isClearable
                blurInputOnSelect={false}
                tabSelectsValue={false}
                maxMenuHeight={240}
                menuIsOpen
              />
            </div>
          </div>
        </div>
      )}

      {errors[name] && (
        <p className="user-checkout-input-error">{errors[name]}</p>
      )}
    </div>
  );
};

export default AddressSelector;
