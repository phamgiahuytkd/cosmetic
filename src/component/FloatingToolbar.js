import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/FloatingToolbar.css";

const FloatingToolbar = ({ onTriggerSearchForm }) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = () => {
    if (open) {
      setClosing(true);
      setTimeout(() => {
        setOpen(false);
        setClosing(false);
      }, 400);
    } else {
      setOpen(true);
    }
  };

  const handleFilterClick = () => {
    if (location.pathname !== "/product") {
      navigate("/product", { state: { showSearchForm: true } });
    } else {
      // 🔥 Phát sự kiện toggleSearchForm để Product nhận được
      window.dispatchEvent(new Event("toggleSearchForm"));
    }
    handleToggle();

  };
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleToggle();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="floating-toolbar" ref={menuRef}>
      <button className="toggle-button" onClick={handleToggle}>
        <i className="fas fa-h-square"></i>
      </button>

      {(open || closing) && (
        <div className={`toolbar-menu ${closing ? "closing" : "open"}`}>
          <button title="Lọc" onClick={handleFilterClick}>
            <i className="fas fa-filter"></i>
          </button>
          <button title="Yêu thích">
            <i className="fas fa-heart"></i>
          </button>
          <button title="Danh mục">
            <i className="fas fa-list"></i>
          </button>
          <button title="Thống kê">
            <i className="fas fa-chart-bar"></i>
          </button>
          <button title="Hỗ trợ">
            <i className="fas fa-headphones"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingToolbar;
