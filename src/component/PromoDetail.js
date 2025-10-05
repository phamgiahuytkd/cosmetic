"use client";

import { useState, useEffect } from "react";
import {
  FaGift,
  FaPercent,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaInfoCircle,
  FaCopy,
  FaCheck,
  FaTag,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { formatDateTimeVN, formatPrice } from "../component/commonFunc";
import "../css/PromoDetail.css";

const PromoDetail = ({ voucher, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Escape để đóng modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !voucher) return null;

  const safeUsagePercentage = voucher.usage_limit
    ? Math.round((voucher.used_count / voucher.usage_limit) * 100)
    : 0;
  const remainingUses =
    typeof voucher.usage_limit === "number" &&
    typeof voucher.used_count === "number"
      ? Math.max(0, voucher.usage_limit - voucher.used_count)
      : "-";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      alert("Không thể sao chép. Mã: " + voucher.code);
    }
  };

  const DiscountIcon =
    voucher.voucher_type === "FIXED_AMOUNT" ? FaMoneyBillWave : FaPercent;

  return (
    <div
      className="user-promo-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-promo-detail-title"
      onClick={onClose}>
      <div
        className="user-promo-detail-modal"
        onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="user-promo-detail-close"
          onClick={onClose}
          aria-label="Đóng">
          <IoClose size={20} />
        </button>

        {/* Header */}
        <header className="user-promo-detail-header">
          <div className="user-promo-detail-badge">
            <FaGift size={20} />
          </div>
          <div className="user-promo-detail-header-info">
            <h3
              id="user-promo-detail-title"
              className="user-promo-detail-title">
              Chi tiết khuyến mãi
            </h3>

            {/* Code copy row */}
            <div
              className="user-promo-detail-code-row"
              role="button"
              tabIndex={0}
              onClick={handleCopyCode}
              onKeyDown={(e) => e.key === "Enter" && handleCopyCode()}>
              <div className="user-promo-detail-code">
                <span className="user-promo-detail-code-text">
                  {voucher.code}
                </span>
              </div>
              <div className="user-promo-detail-code-action">
                {copied ? (
                  <FaCheck className="user-promo-detail-code-icon copied" />
                ) : (
                  <FaCopy className="user-promo-detail-code-icon" />
                )}
              </div>
            </div>

            {/* Discount info */}
            <div className="user-promo-detail-sub">
              <DiscountIcon className="user-promo-detail-sub-icon" />
              <span className="user-promo-detail-sub-text">
                {voucher.voucher_type === "FIXED_AMOUNT"
                  ? `Giảm ${formatPrice(voucher.max_amount)}`
                  : `${voucher.percent}% (tối đa ${formatPrice(
                      voucher.max_amount
                    )})`}
              </span>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="user-promo-detail-body">
          {/* Left */}
          <section className="user-promo-detail-left">
            <div className="user-promo-detail-section">
              <label className="user-promo-detail-label">
                <FaInfoCircle /> Mô tả
              </label>
              <p className="user-promo-detail-description">
                {voucher.description || "-"}
              </p>
            </div>

            <div className="user-promo-detail-row user-promo-detail-small">
              <div className="user-promo-detail-meta">
                <label className="user-promo-detail-label">
                  <FaMoneyBillWave /> Điều kiện
                </label>
                <div className="user-promo-detail-meta-value">
                  {voucher.min_order_amount
                    ? `Đơn từ ${formatPrice(voucher.min_order_amount)}`
                    : "Không yêu cầu"}
                </div>
              </div>

              <div className="user-promo-detail-meta">
                <label className="user-promo-detail-label">
                  <FaTag /> Sử dụng
                </label>
                <div className="user-promo-detail-meta-value">
                  {voucher.used_count} / {voucher.usage_limit}
                </div>
              </div>
            </div>

            <div className="user-promo-detail-section">
              <label className="user-promo-detail-label">
                <FaTag /> Tiến độ sử dụng
              </label>
              <div className="user-promo-detail-progress-wrap">
                <div className="user-promo-detail-progress">
                  <div
                    className="user-promo-detail-progress-bar"
                    style={{ width: `${Math.min(100, safeUsagePercentage)}%` }}
                  />
                </div>
                <div className="user-promo-detail-progress-caption">
                  <span>{safeUsagePercentage}% đã dùng</span>
                  <span>{remainingUses} lần còn lại</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right */}
          <aside className="user-promo-detail-right">
            <div className="user-promo-detail-card">
              <div className="user-promo-detail-card-title">
                Thời gian áp dụng
              </div>

              <div className="user-promo-detail-date-combined">
                <div className="user-promo-detail-date-half start">
                  <FaCalendarAlt className="user-promo-detail-date-icon" />
                  <div className="user-promo-detail-date-text">
                    <div className="user-promo-detail-date-time">
                      {formatDateTimeVN(voucher.start_day)}
                    </div>
                    <div className="user-promo-detail-date-label">Bắt đầu</div>
                  </div>
                </div>

                <div className="user-promo-detail-date-divider" />

                <div className="user-promo-detail-date-half end">
                  <FaCalendarAlt className="user-promo-detail-date-icon" />
                  <div className="user-promo-detail-date-text">
                    <div className="user-promo-detail-date-time">
                      {formatDateTimeVN(voucher.end_day)}
                    </div>
                    <div className="user-promo-detail-date-label">Kết thúc</div>
                  </div>
                </div>
              </div>

              <div className="user-promo-detail-note">
                <small>
                  Nhanh tay kẻo hết lượt — kiểm tra điều kiện trước khi áp dụng.
                </small>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default PromoDetail;
