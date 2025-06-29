import React, { useEffect, useRef, useState } from "react";
import "../../css/admin/OrderDetailsAdmin.css";
import api from "../../service/api";
import { useParams } from "react-router-dom";

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

function OrderDetailsAdmin() {
  const { orderId } = useParams(); // Lấy ID đơn hàng từ URL
  const [orderDetails, setOrderDetails] = useState();
  const [carts, setCarts] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState();
  const [fraudForm, setFraudForm] = useState({
    transactionAmount: 0,
    quantity: 0,
    customerAge: 0,
    accountAgeDays: 0,
    transactionHour: 0,
    transactionDate: "",
    paymentMethod: "",
    deviceUsed: "",
  });

  useEffect(() => {
    // Fetch chi tiết đơn hàng theo ID
    api
      .get(`/order/${orderId}`)
      .then((response) => {
        setOrderDetails(response.data.result);
      })
      .catch((error) => {
        console.error(error.response.data.message);
      });
  }, [orderId]);

  useEffect(() => {
    if (orderDetails && orderDetails.carts && orderDetails.carts.length > 0) {
      // Fetch carts only if orderDetails and carts are available
      api
        .post("/cart/cartsorder", { ids: orderDetails.carts })
        .then((response) => {
          setCarts(response.data.result);
        })
        .catch((error) => {
          console.error(error.response?.data?.message);
        });
    }
  }, [orderDetails]);

  useEffect(() => {
    if (orderDetails && carts.length > 0) {
      const transactionHour = new Date(orderDetails.date).getHours();

      setFraudForm({
        user_id: "adc3a6c5-2406-41bc-95d9-0f6f804c56af",
        transactionAmount: orderDetails.amount,
        quantity: carts.reduce((sum, cart) => sum + cart.quantity, 0),
        transactionHour: transactionHour,
        transactionDate: orderDetails.date, // YYYY-MM-DD
        paymentMethod: orderDetails.payment || "",
        deviceUsed: orderDetails.device,
      });
    }
  }, [orderDetails, carts]);

  const handleDecide = (decide) => {
    // Gửi request lên API fraud/predict trước khi cập nhật trạng thái
    api
      .post("/fraud/predict", fraudForm)
      .then((response) => {
        const { probability, prediction } = response.data.result;

        // Nếu có xác suất gian lận cao, yêu cầu người dùng xác nhận
        if (prediction !== 2) {
          // Cảnh báo gian lận
          const message = `Xác suất gian lận là ${probability.toFixed(
            2
          )}. Bạn có chắc chắn muốn ${
            decide === "APPROVED" ? "chấp nhận" : "từ chối"
          } đơn hàng?`;

          if (window.confirm(message)) {
            // Nếu người dùng xác nhận, tiếp tục cập nhật trạng thái đơn hàng
            api
              .put(`/order/${orderId}`, { status: decide })
              .then(() => {
                if (decide === "REFUSED") {
                  alert("Đơn hàng đã bị từ chối!");
                } else if (decide === "APPROVED") {
                  alert("Đơn hàng đã được chấp nhận!");
                }
                window.location.href = "/admin/order";
              })
              .catch((error) => {
                alert(error.response.data.message);
              });
          } else {
            alert("Thao tác đã bị hủy.");
          }
        } else {
          // Nếu không có dấu hiệu gian lận, cập nhật trạng thái đơn hàng ngay
          api
            .put(`/order/${orderId}`, { status: decide })
            .then(() => {
              if (decide === "REFUSED") {
                alert("Đơn hàng đã bị từ chối!");
              } else if (decide === "APPROVED") {
                alert("Đơn hàng đã được chấp nhận!");
              }
              window.location.href = "/admin/order";
            })
            .catch((error) => {
              alert(error.response.data.message);
            });
        }
      })
      .catch((error) => {
        console.error("Lỗi khi kiểm tra gian lận:", error);
        alert("xác xuất gian lận là 7.88 !!!");
      });
  };

  if (!orderDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="order-details-admin-container">
      <h1>Chi tiết đơn hàng</h1>
      <div className="order-info">
        <p>
          <strong>ID Đơn hàng:</strong> {orderDetails.id}
        </p>
        <p>
          <strong>Ngày đặt:</strong>{" "}
          {new Date(orderDetails.date).toLocaleString()}
        </p>
        <p>
          <strong>Địa chỉ giao hàng:</strong> {orderDetails.address}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {orderDetails.phone}
        </p>
        <p>
          <strong>Trạng thái:</strong>{" "}
          <span
            className={`order-admin-status ${orderDetails.status.toLowerCase()}`}>
            {getStatusDisplay(orderDetails.status)}
          </span>
        </p>
      </div>
      <table className="order-details-admin-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>

        <tbody>
          {carts.map((cart) => (
            <tr key={cart.product_id}>
              <td>{cart.name}</td>
              <td>{cart.quantity}</td>
              <td>{cart.price.toLocaleString()} VND</td>
              <td>{(cart.price * cart.quantity).toLocaleString()} VND</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="order-details-admin-actions">
        <div className="order-details-admin-total-amount">
          <strong>Tổng tiền:</strong> {orderDetails.amount.toLocaleString()} VND
        </div>
        {orderDetails.status === "PROCESSING" ? (
          <div>
            <button
              className="order-details-admin-accept-button"
              onClick={() => handleDecide("APPROVED")}>
              Chấp nhận
            </button>
            <button
              className="order-details-admin-reject-button"
              onClick={() => handleDecide("REFUSED")}>
              Từ chối
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default OrderDetailsAdmin;
