import React, { useEffect, useState } from "react";
import "../css/UserOrders.css";
import OrderCard from "../component/OrderCard";
import api from "../service/api";
import { Link } from "react-router-dom";

const tabs = [
  { key: "processing", label: "Đang xử lý" },
  { key: "delivering", label: "Đang vận chuyển" },
  { key: "pending", label: "Chờ thanh toán" },
  { key: "completed", label: "Thành công" },
  { key: "uncompleted", label: "Đã hủy" },
];

// Hàm ánh xạ tab key sang status của backend
const mapTabKeyToStatus = (tabKey) => {
  switch (tabKey) {
    case "processing":
      return "processing";
    case "delivering":
      return "delivering";
    case "pending":
      return "pending";
    case "completed":
      return "completed";
    case "uncompleted":
      return "uncompleted"; // Nếu backend hỗ trợ nhiều trạng thái, có thể gửi dạng chuỗi
    default:
      return "";
  }
};

const UserOrders = () => {
  const [activeTab, setActiveTab] = useState("processing");
  const [orders, setOrders] = useState([]);

  // useEffect để gọi API khi activeTab thay đổi
  useEffect(() => {
    const status = mapTabKeyToStatus(activeTab);
    if (status) {
      api
        .get(`/order/status/${status}`)
        .then((res) => {
          const orders = res.data.result || [];
          setOrders(orders);
        })
        .catch((err) => {
          console.error(
            err.response?.data?.message || "Lỗi lấy danh sách hóa đơn"
          );
          setOrders([]); // Đặt rỗng nếu có lỗi
        });
    }
  }, [activeTab]);

  const renderContent = () => {
    if (orders.length === 0) {
      return (
        <div className="user-orders-none-order">
          <img src="/icon/orders-none.png" alt="/icon/orders-none.png" />
          <div className="user-orders-none-order-continue">
            <strong>Bạn chưa có đơn hàng nào</strong>
            <Link to="/product"> Tiếp tục mua sắm ngay thôi!</Link>
          </div>
        </div>
      );
    }

    return orders.map((order) => (
      <OrderCard key={order.id} order={order} status={activeTab} />
    ));
  };

  return (
    <div className="user-orders-container">
      <div className="user-orders-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`user-orders-tab ${
              activeTab === tab.key ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="user-orders-content">{renderContent()}</div>
    </div>
  );
};

export default UserOrders;
