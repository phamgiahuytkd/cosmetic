import React, { useEffect, useState } from "react";
import "../../css/admin/OrderAdmin.css";
import logo from "../../logo.svg";
import api from "../../service/api";
import { useNavigate } from "react-router-dom";


function getStatusDisplay(status) {
  switch (status.toLowerCase()) {
    case "processing":
      return "Đang xử lý";
    case "approved":
      return "Đã duyệt";
    case "refused":
      return "Bị từ chối";
    case "cancelled":
      return "Đã hủy";
    default:
      return status; // Giữ nguyên giá trị mặc định nếu không khớp
  }
}


function OrderRow({ order }) {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate(`/admin/order/${order.id}`); // Đường dẫn tới trang chi tiết đơn hàng
    };

  return (
    <tr>
      <td>{new Date(order.date).toLocaleString()}</td>
      <td>{order.address}</td>
      <td>{order.phone}</td>
      <td>{order.amount.toLocaleString()} VND</td>
      <td className={`order-admin-status ${order.status.toLowerCase()}`}>
        {getStatusDisplay(order.status)}
      </td>
      <td>
        {order.status === 'PROCESSING' ? (
        <button className="order-admin-details-button" onClick={handleButtonClick}>
            <i className="fa-solid fa-pen-to-square"></i>
        </button>
        ) : (
          <button className="order-admin-details-button" onClick={handleButtonClick}>
          <i className="fa-solid fa-pen-to-square"></i>
          </button>
        )}
      </td>
    </tr>
  );
}

function OrderAdmin() {
  const [orders, setOders] = useState([]);
    
    useEffect(() => {
        api.get('/order/allorder').then(response => { 
            setOders(response.data.result);
        })
        .catch(error => {
            console.error(error.response.data.message);
        });
    }, []);

  return (
    <div className="order-admin-container">
      <h1 className="order-admin-title">Quản lý đơn hàng</h1>
      <table className="order-admin-table">
        <thead>
          <tr>
            <th>Ngày đặt hàng</th>
            <th>Địa chỉ</th>
            <th>Số điện thoại</th>
            <th>Tổng đơn hàng</th>
            <th>Trạng thái</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderAdmin;
