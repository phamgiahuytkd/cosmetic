import React, { useEffect, useState, useMemo } from "react";
import "../css/UserOrders.css";
import OrderCard from "../component/OrderCard";
import api from "../service/api";
import { Link } from "react-router-dom";
import { useNotifications } from "../component/NotificationContext";

const tabs = [
  { key: "processing", label: "Đang xử lý", status: "PROCESSING" },
  { key: "delivering", label: "Đang vận chuyển", status: "DELIVERING" },
  { key: "pending", label: "Chờ thanh toán", status: "PENDING" },
  { key: "completed", label: "Thành công", status: "COMPLETED" },
  { key: "uncompleted", label: "Đã hủy", status: "UNCOMPLETED" },
];

const UserOrders = () => {
  const [activeTab, setActiveTab] = useState("processing");
  const [orders, setOrders] = useState([]);
  const { notifications, fetchNotifications } = useNotifications();

  // Tạo Map để đếm số thông báo theo trạng thái
  const notificationCounts = useMemo(() => {
    const counts = {
      PROCESSING: 0,
      DELIVERING: 0,
      PENDING: 0,
      COMPLETED: 0,
      UNCOMPLETED: 0,
    };

    const allowedStatuses = [
      "PROCESSING",
      "DELIVERING",
      "PENDING",
      "COMPLETED",
      "UNCOMPLETED",
    ];

    notifications
      .filter((notification) => allowedStatuses.includes(notification.type))
      .forEach((notification) => {
        const status = notification.type?.toUpperCase();
        if (counts.hasOwnProperty(status)) {
          counts[status]++;
        }
      });

    return counts;
  }, [notifications]);

  // useEffect để gọi API khi activeTab thay đổi
  useEffect(() => {
    const tab = tabs.find((tab) => tab.key === activeTab);
    const status = tab?.status || "";
    if (status) {
      api
        .get(`/order/status/${status.toLowerCase()}`)
        .then((res) => {
          const orders = res.data.result || [];
          setOrders(orders);
        })
        .catch((err) => {
          console.error(
            err.response?.data?.message || "Lỗi lấy danh sách hóa đơn"
          );
          setOrders([]);
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
            {notificationCounts[tab.status] > 0 && (
              <span className="notification-badge">
                {notificationCounts[tab.status]}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="user-orders-content">{renderContent()}</div>
    </div>
  );
};

export default UserOrders;
