import React, { useState, useEffect, useCallback, useRef } from "react";
import "../css/InputComponent.css";
import { DayPicker } from "react-day-picker";
import { vi } from "date-fns/locale";
import "../css/DatepickerPopup.css";
import "react-day-picker/dist/style.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Component: InputGroup
const InputGroup = React.memo(
  ({
    name,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    disabled = false,
    errors = {},
  }) => {
    const [localValue, setLocalValue] = useState(value || "");

    useEffect(() => {
      setLocalValue(value || "");
    }, [value]);

    const commitChange = useCallback(() => {
      const trimmedValue = localValue?.trim() || "";
      if (localValue !== value) {
        onChange(name, trimmedValue);
      }
    }, [localValue, value, name, onChange]);

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitChange();
          e.target.blur();
        }
      },
      [commitChange]
    );

    return (
      <div
        className={`user-checkout-input-group ${
          disabled ? "user-checkout-input-group--disabled" : ""
        }`}>
        <div
          className={`user-checkout-input-wrapper ${
            localValue ? "user-checkout-input-wrapper--filled" : ""
          }`}>
          <label className="user-checkout-input-label" htmlFor={name}>
            {label}
          </label>
          <input
            className="user-checkout-input-field"
            name={name}
            type={type}
            placeholder={placeholder}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={commitChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoComplete={name}
          />
        </div>
        {errors[name] && (
          <p className="user-checkout-input-error">{errors[name]}</p>
        )}
      </div>
    );
  }
);

// Component: InputGroupPhone
const InputGroupPhone = React.memo(
  ({ name, value, onChange, disabled = false, errors = {} }) => {
    const [localValue, setLocalValue] = useState(value || "");

    useEffect(() => {
      setLocalValue(value || "");
    }, [value]);

    const commitChange = useCallback(() => {
      const trimmedValue = localValue?.trim() || "";
      if (localValue !== value) {
        onChange(name, trimmedValue);
      }
    }, [localValue, value, name, onChange]);

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitChange();
          e.target.blur();
        }
      },
      [commitChange]
    );

    return (
      <div className="user-checkout-input-group">
        <div
          className={`user-checkout-input-wrapper ${
            localValue ? "user-checkout-input-wrapper--filled" : ""
          }`}>
          <label className="user-checkout-input-label" htmlFor={name}>
            Số điện thoại
          </label>
          <input
            className="user-checkout-input-field"
            name={name}
            type="text"
            placeholder="Nhập số điện thoại"
            value={localValue}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/\D/g, "").slice(0, 11);
              setLocalValue(onlyNums);
            }}
            onBlur={commitChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoComplete={name}
          />
          <div className="user-checkout-select-container">
            <div className="user-checkout-select-control user-checkout-select-control--disabled">
              <span className="user-checkout-select-value">🇻🇳</span>
            </div>
          </div>
        </div>
        {errors[name] && (
          <p className="user-checkout-input-error">{errors[name]}</p>
        )}
      </div>
    );
  }
);

// Component: InputDateGroup
const InputDateGroup = React.forwardRef(
  (
    {
      name,
      label,
      value,
      onChange,
      disabled = false,
      errors = {},
      placeholder = "dd/mm/yyyy",
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(value || "");
    const [showCalendar, setShowCalendar] = useState(false);
    const [dob, setDob] = useState(value ? new Date(value) : null);
    const inputRef = useRef(null);
    const [isComposing, setIsComposing] = useState(false);
    const [rawInput, setRawInput] = useState(""); // Tạm giữ dữ liệu thô khi đang gõ IME

    // Chuẩn hóa ngày thành định dạng dd/mm/yyyy
    const formatDateString = (input) => {
      const cleaned = input.replace(/[^0-9]/g, "");
      let formatted = "";

      if (cleaned.length <= 2) {
        formatted = cleaned;
      } else if (cleaned.length <= 4) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
      } else {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(
          2,
          4
        )}/${cleaned.slice(4, 8)}`;
      }

      return formatted.slice(0, 10);
    };

    // Chuẩn hóa ngày từ Date object thành dd/mm/yyyy
    const standardizeDateFormat = (date) => {
      if (!date || isNaN(date.getTime())) return "";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Kiểm tra định dạng và hợp lệ ngày
    const validateDateFormat = (dateStr) => {
      // Kiểm tra nếu dateStr không phải chuỗi hoặc rỗng
      if (!dateStr || typeof dateStr !== "string") {
        return "Vui lòng nhập ngày sinh.";
      }

      const dateRegex =
        /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/(\d{4})$/;
      if (!dateRegex.test(dateStr)) {
        return "Vui lòng nhập ngày sinh theo: dd/mm/yyyy (ví dụ: 25/12/2000).";
      }

      const [day, month, year] = dateStr.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      const today = new Date();
      const todayStr = today.toLocaleDateString("vi-VN");
      if (
        isNaN(date.getTime()) ||
        date.getDate() !== day ||
        date.getMonth() !== month - 1 ||
        date.getFullYear() !== year ||
        date > new Date()
      ) {
        return `Ngày sinh phải nhỏ hơn hoặc bằng (${todayStr}).`;
      }

      return "";
    };

    const handleCompositionEnd = () => {
      setIsComposing(false);
      const formatted = formatDateString(rawInput);
      setLocalValue(formatted);
      const error = validateDateFormat(formatted);
      onChange(name, { value: formatted, error });

      // Đặt con trỏ về cuối
      setTimeout(() => {
        if (inputRef.current) {
          const len = formatted.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 0);
    };

    const handleDateInputChange = useCallback(
      (e) => {
        const raw = e.target.value;
        setRawInput(raw);

        if (!isComposing) {
          const formatted = formatDateString(raw);
          setLocalValue(formatted);
          const error = validateDateFormat(formatted);
          onChange(name, { value: formatted, error });

          setTimeout(() => {
            if (inputRef.current) {
              const len = formatted.length;
              inputRef.current.setSelectionRange(len, len);
            }
          }, 0);
        } else {
          setLocalValue(raw);
        }
      },
      [isComposing, name, onChange]
    );

    const handleCompositionStart = () => setIsComposing(true);

    // Mở lịch khi click hoặc focus vào input
    const handleInputClickOrFocus = useCallback(() => {
      if (!disabled) {
        setShowCalendar(true);
      }
    }, [disabled]);

    useEffect(() => {
      // Đảm bảo value là chuỗi, nếu không thì đặt thành ""
      setLocalValue(value || "");
      setDob(value && typeof value === "string" ? new Date(value) : null);
    }, [value]);

    const handleDateSelect = useCallback(
      (date) => {
        if (date) {
          const formattedDate = standardizeDateFormat(date); // Chuẩn hóa định dạng
          setLocalValue(formattedDate);
          setDob(date);
          setShowCalendar(false); // Đóng lịch sau khi chọn ngày
          const error = validateDateFormat(formattedDate);
          onChange(name, { value: formattedDate, error });
        }
      },
      [name, onChange]
    );

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          ref?.current &&
          !ref.current.contains(event.target) &&
          inputRef.current &&
          !inputRef.current.contains(event.target)
        ) {
          // Chỉ đóng lịch nếu không click vào input hoặc lịch
          setShowCalendar(false);
          const error = validateDateFormat(localValue);
          onChange(name, { value: localValue, error });
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [localValue, name, onChange, ref]);

    const customVi = {
      ...vi,
      localize: {
        ...vi.localize,
        month: (monthIndex, options) => {
          const isFormatting = options?.width !== "narrow";
          return isFormatting ? `Tháng ${monthIndex + 1}` : `${monthIndex + 1}`;
        },
      },
    };

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const error = validateDateFormat(localValue);
          onChange(name, { value: localValue, error });
          setShowCalendar(false); // Đóng lịch khi nhấn Enter
          if (inputRef.current) {
            inputRef.current.blur();
          }
        }
      },
      [name, localValue, onChange]
    );

    const handleBlur = useCallback(() => {
      const error = validateDateFormat(localValue);
      onChange(name, { value: localValue, error });
      // Không đóng lịch ở đây để cho phép chọn từ DayPicker
    }, [name, localValue, onChange]);

    return (
      <div
        className={`user-checkout-input-group ${
          disabled ? "user-checkout-input-group--disabled" : ""
        }`}>
        <div
          className={`user-checkout-input-wrapper ${
            localValue ? "user-checkout-input-wrapper--filled" : ""
          }`}>
          <label className="user-checkout-input-label" htmlFor={name}>
            {label}
          </label>
          <input
            ref={inputRef}
            className="user-checkout-input-field"
            name={name}
            type="text"
            placeholder={placeholder}
            value={localValue}
            onChange={handleDateInputChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={handleInputClickOrFocus} // Mở lịch khi click
            onFocus={handleInputClickOrFocus} // Mở lịch khi focus
            disabled={disabled}
            autoComplete="off"
          />
        </div>
        {showCalendar && (
          <div className="datepicker-popup" ref={ref}>
            <DayPicker
              mode="single"
              selected={dob}
              onSelect={handleDateSelect}
              locale={customVi}
              captionLayout="dropdown"
              fromYear={1920}
              toYear={new Date().getFullYear()}
              toDate={new Date()}
              formatters={{
                formatCaption: (date) => {
                  const month = date.getMonth() + 1;
                  return `Tháng ${month}`;
                },
              }}
            />
          </div>
        )}
        {errors[name] && (
          <p className="user-checkout-input-error">{errors[name]}</p>
        )}
      </div>
    );
  }
);

// Component: InputGroupPassword
const InputGroupPassword = React.memo(
  ({
    name,
    label,
    placeholder,
    value,
    onChange,
    disabled = false,
    errors = {},
  }) => {
    const [localValue, setLocalValue] = useState(value || "");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
      setLocalValue(value || "");
    }, [value]);

    const commitChange = useCallback(() => {
      const trimmedValue = localValue?.trim() || "";
      if (localValue !== value) {
        onChange(name, trimmedValue);
      }
    }, [localValue, value, name, onChange]);

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitChange();
          e.target.blur();
        }
      },
      [commitChange]
    );

    return (
      <div
        className={`user-checkout-input-group ${
          disabled ? "user-checkout-input-group--disabled" : ""
        }`}>
        <div
          className={`user-checkout-input-wrapper ${
            localValue ? "user-checkout-input-wrapper--filled" : ""
          }`}>
          <label className="user-checkout-input-label" htmlFor={name}>
            {label}
          </label>
          <input
            className="user-checkout-input-field"
            name={name}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={commitChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoComplete={name}
          />
          <div className="user-checkout-select-container">
            <button
              type="button"
              className="user-checkout-select-control"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        {errors[name] && (
          <p className="user-checkout-input-error">{errors[name]}</p>
        )}
      </div>
    );
  }
);

export { InputGroup, InputGroupPhone, InputDateGroup, InputGroupPassword };
