// components/UserOrderCard.js
import React, { useMemo } from "react";
import OrderStatusTag from "./OrderStatusTag";
import "../css/OrderCard.css";
import { HiDocumentCurrencyDollar, HiMiniMapPin } from "react-icons/hi2";
import {
  IoLocationOutline,
  IoPhonePortraitOutline,
  IoTodayOutline,
} from "react-icons/io5";
import { LuMapPinHouse } from "react-icons/lu";
import { formatDateTimeVN, formatPrice } from "./commonFunc";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "./NotificationContext";
import { MdNotificationsActive } from "react-icons/md";
import api from "../service/api";

const OrderCard = ({ order, status }) => {
  const navigate = useNavigate();
  const { notifications, fetchNotifications } = useNotifications();
  const handleOrderClick = async (id) => {
    try {
      await api.delete(`/notify/${id}`);
      fetchNotifications();
      navigate(`/order-detail/${id}`);
    } catch (error) {
      console.error(error.response?.data?.message || "Lỗi khi xử lý thông báo");
    }
  };

  // Tạo Map để lưu type_id của các thông báo có type là ORDER
  const unreadOrderNotifications = useMemo(() => {
    const orderNotifications = new Map();
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
        orderNotifications.set(notification.type_id, true);
      });

    return orderNotifications;
  }, [notifications]);

  return (
    <div
      className="user-order-card-container"
      onClick={() => handleOrderClick(order.id)}>
      <div className="user-order-card-header">
        <div>
          {unreadOrderNotifications.has(order.id) ? (
            <MdNotificationsActive style={{ color: "#fa5f9d" }} />
          ) : (
            <HiDocumentCurrencyDollar />
          )}

          <p>
            <strong>Mã đơn hàng:</strong>
            <span className="user-order-card-header-code">{order?.id}</span>
          </p>
        </div>
        <OrderStatusTag status={order?.status} />
      </div>
      <div className="user-order-card-body">
        <div className="user-order-card-body-detail">
          <div>
            <IoTodayOutline />
            <strong>
              <span>Ngày đặt</span> <span>:</span>
            </strong>
            {formatDateTimeVN(order?.date)}
          </div>
          <div>
            <IoPhonePortraitOutline size={18} />
            <strong>
              <span>SĐT </span> <span>:</span>
            </strong>
            {order?.phone}
          </div>
          <div>
            <LuMapPinHouse size={18} />
            <strong>
              <span>Địa chỉ </span> <span>:</span>
            </strong>
            {order?.address} {" - "} {order?.fulladdress}
          </div>
        </div>

        <div className="user-order-card-body-total">
          <div>
            <strong>Tổng tiền:</strong> {formatPrice(order?.amount)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
