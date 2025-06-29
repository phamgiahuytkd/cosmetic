// components/OrderStatusTag.js
import React from "react";
import "../css/OrderStatusTag.css";

import { FcProcess } from "react-icons/fc";
import { RiMoneyDollarCircleLine, RiTruckLine } from "react-icons/ri";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";

// Hàm ánh xạ trạng thái backend sang frontend key
export const mapStatusToTabKey = (status) => {
  switch (status) {
    case "PROCESSING":
      return "PROCESSING";
    case "DELIVERING":
      return "DELIVERING";
    case "PENDING":
      return "PENDING";
    case "COMPLETED":
      return "COMPLETED";
    case "UNCOMPLETED":
      return "UNCOMPLETED";
    default:
      return "unknown";
  }
};

export const statusColors = {
  PROCESSING: { background: "#F0E4FF", text: "#9c27b0" },
  DELIVERING: { background: "#d1ecf1", text: "#0c5460" },
  PENDING: { background: "#fff3cd", text: "#856404" },
  COMPLETED: { background: "#d4edda", text: "#155724" },
  UNCOMPLETED: { background: "#f8d7da", text: "#721c24" },
  unknown: { background: "#e0e0e0", text: "#333" },
};

export const statusLabels = {
  PROCESSING: "Đang xử lý",
  DELIVERING: "Đang vận chuyển",
  PENDING: "Chờ thanh toán",
  COMPLETED: "Thành công",
  UNCOMPLETED: "Đơn đã hủy",
  APPROVED: "Đã xác nhận",
  REFUSED: "Bị từ chối",
  CANCELED: "Đã hoàn tác",
  DELIVERED: "Đã giao hàng",
  unknown: "Không rõ",
};

export const statusIcons = {
  PROCESSING: <FcProcess />,
  DELIVERING: <RiTruckLine />,
  PENDING: <RiMoneyDollarCircleLine />,
  COMPLETED: <IoMdCheckmarkCircleOutline />,
  UNCOMPLETED: <MdOutlineCancel />,
  unknown: null,
};

const OrderStatusTag = ({ status, des }) => {
  const key = mapStatusToTabKey(status);
  const colors = statusColors[key];
  let label = statusLabels[status];
  if (des) {
    label = statusLabels[des];
  }
  const icon = statusIcons[key];

  return (
    <span
      className="user-order-status-tag"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
      }}>
      {icon}
      <p>{label}</p>
    </span>
  );
};

export default OrderStatusTag;
