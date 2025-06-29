import React, { useState, useEffect, useRef, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { vi } from "date-fns/locale";
import "../authenticate/Signup.css";

const InputDateGroupSignup = React.forwardRef(
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
    const [rawInput, setRawInput] = useState("");

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

    const handleInputClickOrFocus = useCallback(() => {
      if (!disabled) {
        setShowCalendar(true);
      }
    }, [disabled]);

    useEffect(() => {
      setLocalValue(value || "");
      setDob(value && typeof value === "string" ? new Date(value) : null);
    }, [value]);

    const handleDateSelect = useCallback(
      (date) => {
        if (date) {
          const formattedDate = standardizeDateFormat(date);
          setLocalValue(formattedDate);
          setDob(date);
          setShowCalendar(false);
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
          setShowCalendar(false);
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
    }, [name, localValue, onChange]);

    return (
      <div className="signup-input-group">
        <label htmlFor={name}>{label}</label>
        <input
          ref={inputRef}
          type="text"
          id={name}
          placeholder={placeholder}
          value={localValue}
          onChange={handleDateInputChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onClick={handleInputClickOrFocus}
          onFocus={handleInputClickOrFocus}
          disabled={disabled}
          autoComplete="off"
        />
        {showCalendar && (
          <div className="signup-datepicker-popup" ref={ref}>
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
        {errors[name] && <p className="signup-error">{errors[name]}</p>}
      </div>
    );
  }
);

export default InputDateGroupSignup;
