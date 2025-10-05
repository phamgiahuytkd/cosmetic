import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Typography,
  TextField,
} from "@mui/material";
import { FaInfoCircle } from "react-icons/fa";
import { RiDiscountPercentFill, RiMoneyDollarCircleFill } from "react-icons/ri";
import "../css/VoucherSelector.css";
import { formatDateTimeVN, formatPrice } from "./commonFunc";
import PromoDetail from "./PromoDetail";

/**
 * Props:
 * - open: boolean
 * - onClose: function
 * - vouchers: array
 * - onSelectVoucher: function(v)
 * - selectedVoucher: object or id
 * - totalOrderAmount: number (tổng tiền đơn hàng để kiểm tra min_order_amount)
 */
const VoucherSelector = ({
  open,
  onClose,
  vouchers = [],
  onSelectVoucher,
  selectedVoucher,
  totalOrderAmount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetailVoucher, setSelectedDetailVoucher] = useState(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        const el = document.querySelector(".user-checkout-voucher-modal");
        el?.scrollTo?.({ top: 0, behavior: "smooth" });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lọc voucher theo mã code
  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hàm kiểm tra điều kiện voucher
  const isVoucherValid = (voucher) => {
    const isExpired = new Date(voucher.end_day) < new Date();
    const isUsedUp =
      typeof voucher.usage_limit === "number" &&
      voucher.used_count >= voucher.usage_limit;
    const isBelowMinOrder = totalOrderAmount < voucher.min_order_amount;
    return !isExpired && !isUsedUp && !isBelowMinOrder;
  };

  // Hàm mở modal chi tiết
  const handleShowDetails = (voucher) => {
    setSelectedDetailVoucher(voucher);
    setDetailOpen(true);
  };

  // Hàm đóng modal chi tiết
  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedDetailVoucher(null);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="voucher-modal-title">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "92%", sm: 600 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            maxHeight: "86vh",
            overflowY: "auto",
          }}
          className="user-checkout-voucher-modal">
          <Typography
            id="voucher-modal-title"
            variant="h6"
            component="h2"
            className="user-checkout-voucher-modal-title">
            Chọn mã giảm giá
          </Typography>

          <div className="user-checkout-voucher-sub">
            Chọn mã phù hợp để áp vào đơn hàng. Nhấn{" "}
            <span className="user-checkout-voucher-hint">🔍</span> để xem chi
            tiết.
          </div>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tìm kiếm mã giảm giá..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="user-checkout-voucher-search"
            sx={{ mb: 2 }}
          />

          <RadioGroup>
            {filteredVouchers.length > 0 ? (
              <div className="user-checkout-voucher-list">
                {filteredVouchers.map((v) => {
                  const isExpired = new Date(v.end_day) < new Date();
                  const isUsedUp =
                    typeof v.usage_limit === "number" &&
                    v.used_count >= v.usage_limit;
                  const isBelowMinOrder = totalOrderAmount < v.min_order_amount;
                  const disabled = isExpired || isUsedUp || isBelowMinOrder;
                  const isSelected =
                    (selectedVoucher &&
                      (selectedVoucher.id ?? selectedVoucher) === v.id) ||
                    String(selectedVoucher) === String(v.id);

                  const labelNode = (
                    <div className="user-checkout-voucher-label" aria-hidden>
                      <div className="user-checkout-voucher-icon">
                        {v.voucher_type === "FIXED_AMOUNT" ? (
                          <RiMoneyDollarCircleFill />
                        ) : (
                          <RiDiscountPercentFill />
                        )}
                      </div>
                      <div className="user-checkout-voucher-main">
                        <div className="user-checkout-voucher-code">
                          {v.code}
                          <div className="user-checkout-voucher-actions">
                            <button
                              type="button"
                              className="user-checkout-voucher-info"
                              title="Xem chi tiết"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowDetails(v);
                              }}
                              aria-label={`Xem chi tiết ${v.code}`}>
                              <FaInfoCircle />
                            </button>
                          </div>
                        </div>
                        <div className="user-checkout-voucher-desc">
                          Giảm{" "}
                          {v.voucher_type === "FIXED_AMOUNT"
                            ? formatPrice(v.max_amount)
                            : v.percent +
                              "% - Tối đa " +
                              formatPrice(v.max_amount)}
                        </div>
                        <div className="user-checkout-voucher-desc">
                          Đơn tối thiểu {formatPrice(v.min_order_amount)}
                        </div>
                        <div className="user-checkout-voucher-desc">
                          HSD: {formatDateTimeVN(v.end_day)}
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <div
                      key={v.id}
                      className={`user-checkout-voucher-option-wrapper ${
                        disabled ? "user-checkout-voucher-option--disabled" : ""
                      } ${
                        isSelected
                          ? "user-checkout-voucher-option--selected"
                          : ""
                      }`}>
                      <FormControlLabel
                        className={`user-checkout-voucher-option ${
                          disabled
                            ? "user-checkout-voucher-option--disabled"
                            : ""
                        }`}
                        value={v.id}
                        control={<Radio disabled={disabled} />}
                        label={labelNode}
                        labelPlacement="start"
                        onChange={() => onSelectVoucher && onSelectVoucher(v)}
                      />
                      {disabled && (
                        <div className="user-checkout-voucher-overlay">
                          {isExpired
                            ? "Hết hạn"
                            : isUsedUp
                            ? "Đã hết lượt"
                            : "Đơn hàng chưa đủ"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Typography sx={{ p: 2, textAlign: "center", color: "#6b7280" }}>
                {searchQuery
                  ? "Không tìm thấy mã giảm giá phù hợp."
                  : "Không có mã giảm giá nào."}
              </Typography>
            )}
          </RadioGroup>

          <Box
            className="user-checkout-voucher-modal-footer"
            sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={onClose}>Đóng</Button>
          </Box>
        </Box>
      </Modal>

      <PromoDetail
        voucher={selectedDetailVoucher}
        isOpen={detailOpen}
        onClose={handleCloseDetail}
      />
    </>
  );
};

export default VoucherSelector;
