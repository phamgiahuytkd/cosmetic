import React, { useState, useEffect, useCallback } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import debounce from "lodash.debounce";
import "../css/AddressSuggestionInput.css";
import "../css/InputComponent.css";

const parseLocationContext = (locationString) => {
  if (!locationString) return { province: "", district: "", ward: "" };

  const parts = locationString.split(",").map((p) => p.trim());
  return {
    province: parts[0] || "",
    district: parts[1] || "",
    ward: parts[2] || "",
  };
};

const AddressSuggestionInput = React.memo(
  ({
    name,
    label,
    placeholder,
    locationContext, // string: "Tỉnh Bắc Kạn, Huyện Ngân Sơn, Xã Cốc Đán"
    value,
    onChange,
    disabled = false,
    errors = {},
  }) => {
    const [localValue, setLocalValue] = useState(value || "");

    useEffect(() => {
      setLocalValue(value || "");
    }, [value]);

    const { province, district, ward } = parseLocationContext(locationContext);

    const fetchSuggestions = async (inputValue) => {
      if (!inputValue || inputValue.length < 3) return [];

      if (!province || !district) {
        console.error(
          "Thiếu thông tin province hoặc district trong locationContext"
        );
        return [];
      }

      const shortQuery = `${inputValue}, ${district}, ${province}`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        shortQuery
      )}&addressdetails=1&limit=10`;

      try {
        const res = await axios.get(url, {
          headers: {
            "Accept-Language": "vi",
          },
        });

        const sortedSuggestions = res.data.sort(
          (a, b) => (b.importance || 0) - (a.importance || 0)
        );

        return sortedSuggestions.map((sug) => {
          const parts = sug.display_name.split(", ");
          const locationParts = [
            province,
            district,
            ward,
            "Việt Nam",
            ...parts.filter((part) => /\d{5}/.test(part)),
          ].filter(Boolean);
          const relevantParts = parts.filter(
            (part) => !locationParts.includes(part.trim())
          );
          const relevantPart = relevantParts.join(", ").trim();

          return {
            value: relevantPart,
            label: relevantPart,
            original: sug,
          };
        });
      } catch (error) {
        console.error("Lỗi khi gọi API Nominatim:", error);
        return [];
      }
    };

    const debouncedLoadOptions = useCallback(
      debounce((inputValue, callback) => {
        fetchSuggestions(inputValue).then(callback);
      }, 500),
      [locationContext]
    );

    const handleChange = useCallback(
      (selectedOption) => {
        const newValue = selectedOption ? selectedOption.value : localValue;
        setLocalValue(newValue);
        onChange(name, newValue);
      },
      [name, onChange, localValue]
    );

    const handleInputChange = useCallback((inputValue, { action }) => {
      if (action === "input-change") {
        setLocalValue(inputValue);
      }
      return inputValue;
    }, []);

    const isInputDisabled = disabled || !province || !district;

    const customStyles = {
      control: (provided, state) => ({
        ...provided,
        height: "100%",
        width: "100%",
        border: "none",
        background: "transparent",
        boxShadow: "none",
        padding: "0",
        margin: "0",
        fontSize: "small",
        cursor: state.isDisabled ? "not-allowed" : "text",
      }),
      input: (provided) => ({
        ...provided,
        height: "100%",
        width: "100%",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }),
      valueContainer: (provided) => ({
        ...provided,
        padding: 0,
        margin: 0,
      }),
      singleValue: (provided) => ({
        ...provided,
        color: "#171717",
        margin: 0,
        padding: 0,
      }),
      placeholder: (provided) => ({
        ...provided,
        color: "#757575",
        margin: 0,
        padding: 0,
      }),
      menu: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0,
        width: "100%",
        border: "1px solid #ccc",
        borderRadius: "0.2rem",
        boxShadow: "none",
        background: "white",
        maxHeight: "25rem",
        overflowY: "auto",
        zIndex: 2,
        position: "absolute",
        top: "105%",
        left: "0%",
      }),
      menuList: (provided) => ({
        ...provided,
        padding: 0,
      }),
      option: (provided, state) => ({
        ...provided,
        padding: "8px",
        cursor: "pointer",
        background: state.isFocused ? "#f0f0f0" : "white",
        color: "#171717",
      }),
      loadingMessage: (provided) => ({
        ...provided,
        fontSize: "12px",
        color: "#666",
        padding: "4px 8px",
      }),
      noOptionsMessage: (provided) => ({
        ...provided,
        fontSize: "12px",
        color: "#666",
        padding: "8px",
      }),
      indicatorSeparator: () => ({ display: "none" }),
      dropdownIndicator: () => ({ display: "none" }),
      indicatorsContainer: () => ({ display: "none" }),
    };

    return (
      <div
        className={`user-checkout-input-group ${
          isInputDisabled ? "user-checkout-input-group--disabled" : ""
        }`}>
        <div
          className={`user-checkout-input-wrapper ${
            localValue ? "user-checkout-input-wrapper--filled" : ""
          }`}>
          <label className="user-checkout-input-label" htmlFor={name}>
            {label}
          </label>
          <AsyncSelect
            inputId={name}
            className="user-checkout-input-field-address-detail"
            cacheOptions
            loadOptions={debouncedLoadOptions}
            defaultOptions={true}
            onChange={handleChange}
            onInputChange={handleInputChange}
            value={localValue ? { value: localValue, label: localValue } : null}
            placeholder={placeholder}
            isDisabled={isInputDisabled}
            styles={customStyles}
            noOptionsMessage={() => "Không tìm thấy địa chỉ"}
            loadingMessage={() => "Đang tìm..."}
            classNamePrefix="user-checkout"
          />

          {(!province || !district) && (
            <p className="user-checkout-input-warning">
              Vui lòng chọn tỉnh và quận trước khi nhập địa chỉ chi tiết
            </p>
          )}
        </div>
        {errors[name] && (
          <p className="user-checkout-input-error">{errors[name]}</p>
        )}
      </div>
    );
  }
);

export default AddressSuggestionInput;
