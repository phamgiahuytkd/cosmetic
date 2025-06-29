import React, { useEffect, useRef, useState } from "react";
import "../css/OrderDetail.css";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import api from "../service/api";
import { moveItem } from "framer-motion";
import { getImageUrl } from "../component/commonFunc";
import OrderStatusTag, {
  mapStatusToTabKey,
  statusColors,
  statusIcons,
  statusLabels,
} from "../component/OrderStatusTag";
import { paymentMethods } from "../component/PaymentOptionCheckout";
import { v4 } from "uuid";
import { FaGift } from "react-icons/fa";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState([]);
  const [latestStatus, setLatestStatus] = useState({});
  const [paidStatus, setPaidStatus] = useState({});

  const [cartOrder, setCartOrder] = useState([]);

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [classNames, setClassNames] = useState({ left: "", right: "" });

  useEffect(() => {
    const leftHeight = leftRef.current?.offsetHeight || 0;
    const rightHeight = rightRef.current?.offsetHeight || 0;

    if (leftHeight > rightHeight) {
      setClassNames({ left: "taller", right: "shorter" });
    } else if (rightHeight > leftHeight) {
      setClassNames({ left: "shorter", right: "taller" });
    } else {
      setClassNames({ left: "", right: "" }); // bằng nhau thì không gán
    }
  }, [order, cartOrder]);

  useEffect(() => {
    api
      .get(`/order/${id}`)
      .then((response) => {
        setOrder(response.data.result);
        // Dừng trạng thái tải
      })
      .catch((error) => {
        console.error(error.response?.data?.message || "Lỗi không xác định");
      });
  }, [id]);

  useEffect(() => {
    api
      .get(`/order-status/${id}`)
      .then((response) => {
        setOrderStatus(response.data.result);
        setPaidStatus(
          response.data.result.find((item) => item.status === "PAID")
        );
        const statuses = response.data.result;

        const hasPaid = statuses.some((s) => s.status === "PAID");
        const hasDelivered = statuses.some((s) => s.status === "DELIVERED");

        if (hasPaid && hasDelivered) {
          // Trả về PAID nếu cả hai cùng tồn tại
          const paidStatus = statuses.find((s) => s.status === "PAID");
          setLatestStatus(paidStatus);
        } else {
          // Bỏ PAID nếu có nhưng chưa có DELIVERED
          const filtered = statuses.filter((s) => s.status !== "PAID");

          // Lấy status có update_day mới nhất
          const latest = filtered.reduce((latest, current) => {
            return new Date(current.update_day) > new Date(latest.update_day)
              ? current
              : latest;
          }, filtered[0]);

          setLatestStatus(latest);
        }

        // Dừng trạng thái tải
      })
      .catch((error) => {
        console.error(error.response?.data?.message || "Lỗi không xác định");
      });
  }, [id]);

  useEffect(() => {
    api
      .get(`/cart/order/${id}`)
      .then((response) => {
        setCartOrder(response.data.result);
      })
      .catch((error) => {
        console.error(error.response?.data?.message || "Lỗi không xác định");
      });
  }, [id]);

  const onclickPay = () => {
    const myUUID = v4();
    api
      .post("/api/momo/create", {
        orderId: myUUID,
        amount: order?.amount,
        orderInfo: order?.id,
        requestId: myUUID,
      })
      .then((res) => {
        // Gọi lại API để lấy danh sách địa chỉ mới
        const redirectUrl = res.data.payUrl; // tuỳ theo cấu trúc response
        window.location.href = redirectUrl;
      })
      .catch((err) => {
        console.error(err.response?.data?.message || "Lỗi thanh toán");
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể thanh toán!",
        });
      });
  };

  const cancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn huỷ đơn hàng?",
      text: "Thao tác này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Có, huỷ đơn hàng",
      cancelButtonText: "Không",
    });

    if (result.isConfirmed) {
      try {
        await api.post("/order-status", {
          order_id: orderId,
          status: "CANCELED",
          description: "Người dùng huỷ đơn hàng",
        });

        Swal.fire("Đã huỷ!", "Đơn hàng của bạn đã được huỷ.", "success");
        window.location.reload(); // Hoặc gọi hàm refetch lại order nếu đang dùng React Query
      } catch (error) {
        console.error(error);
        Swal.fire("Lỗi!", "Không thể huỷ đơn hàng. Vui lòng thử lại.", "error");
      }
    }
  };

  const tabKey = mapStatusToTabKey(order?.status);
  const colorSet = statusColors[tabKey];
  const statusIcon = statusIcons[tabKey];
  const statusLabel = statusLabels[tabKey];

  return (
    <div className="user-order-detail-main-container">
      <div className={`user-order-detail-left-container ${classNames.left}`}>
        <div ref={leftRef} className="user-order-detail-content-wrapper">
          <div className="user-order-detail-section-container">
            <div className="user-order-detail-payment-status">
              <div
                className="user-order-detail-payment-header"
                style={{
                  backgroundColor: colorSet.background,
                  color: colorSet.text,
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}>
                <span
                  className="user-order-detail-payment-icon"
                  style={{ fontSize: "24px" }}>
                  {statusIcon}
                </span>
                <div className="user-order-detail-payment-content">
                  <div
                    className="user-order-detail-payment-title"
                    style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    {statusLabel}
                  </div>
                  <div
                    className="user-order-detail-payment-order"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}>
                    <span className="user-order-detail-payment-order-text">
                      Đơn hàng:
                    </span>
                    <span className="user-order-detail-payment-order-id">
                      {order?.id}
                    </span>
                    <button
                      className="user-order-detail-copy-button"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none">
                        <path
                          d="M16.5 1H4.5C3.4 1 2.5 1.9 2.5 3V17H4.5V3H16.5V1ZM19.5 5H8.5C7.4 5 6.5 5.9 6.5 7V21C6.5 22.1 7.4 23 8.5 23H19.5C20.6 23 21.5 22.1 21.5 21V7C21.5 5.9 20.6 5 19.5 5ZM19.5 21H8.5V7H19.5V21Z"
                          fill={colorSet.text}
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="user-order-detail-step-container">
                <div className="user-order-detail-step-circle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 5.18L10.59 16.6L6.35 12.36L7.76 10.95L10.59 13.78L20.59 3.78L22 5.18ZM19.79 10.22C19.92 10.79 20 11.39 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C13.58 4 15.04 4.46 16.28 5.25L17.72 3.81C16.1 2.67 14.13 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 10.81 21.78 9.67 21.4 8.61L19.79 10.22Z"
                      fill="#fff"
                    />
                  </svg>
                </div>
                <div className="user-order-detail-step-line"></div>
                <div className="user-order-detail-step-content">
                  <p className="user-order-detail-step-title">
                    Đặt hàng thành công
                  </p>
                  {/* <p className="user-order-detail-step-subtitle">
                    vài giây trước
                  </p> */}
                </div>
              </div>
            </div>
            <div className="user-order-detail-payment-info">
              <div
                className={`user-order-detail-payment-tag ${
                  paidStatus
                    ? "paid"
                    : order?.status === "PROCESSING" ||
                      order?.status === "UNCOMPLETED"
                    ? "processing"
                    : ""
                }`}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10.0001 1.66663C5.40008 1.66663 1.66675 5.39996 1.66675 9.99996C1.66675 14.6 5.40008 18.3333 10.0001 18.3333C14.6001 18.3333 18.3334 14.6 18.3334 9.99996C18.3334 5.39996 14.6001 1.66663 10.0001 1.66663ZM10.0001 16.6666C6.32508 16.6666 3.33341 13.675 3.33341 9.99996C3.33341 6.32496 6.32508 3.33329 10.0001 3.33329C13.6751 3.33329 16.6667 6.32496 16.6667 9.99996C16.6667 13.675 13.6751 16.6666 10.0001 16.6666ZM10.7417 9.24996C9.25842 8.75829 8.54175 8.44996 8.54175 7.66663C8.54175 6.81663 9.46675 6.50829 10.0501 6.50829C11.1417 6.50829 11.5417 7.33329 11.6334 7.62496L12.9501 7.06663C12.8251 6.69996 12.2667 5.47496 10.7334 5.20829V4.16663H9.27508V5.21663C7.10842 5.68329 7.09175 7.59163 7.09175 7.68329C7.09175 9.57496 8.96675 10.1083 9.88342 10.4416C11.2001 10.9083 11.7834 11.3333 11.7834 12.1333C11.7834 13.075 10.9084 13.475 10.1334 13.475C8.61675 13.475 8.18342 11.9166 8.13342 11.7333L6.75008 12.2916C7.27508 14.1166 8.65008 14.6083 9.26675 14.7583V15.8333H10.7251V14.8C11.1584 14.725 13.2417 14.3083 13.2417 12.1166C13.2501 10.9583 12.7417 9.94163 10.7417 9.24996Z" />
                </svg>
                <span
                  className={`user-order-detail-payment-tag-text ${
                    paidStatus
                      ? "paid"
                      : order?.status === "PROCESSING" ||
                        order?.status === "UNCOMPLETED"
                      ? "processing"
                      : ""
                  }`}>
                  {paidStatus
                    ? "Thanh toán thành công"
                    : order?.status === "PROCESSING" ||
                      order?.status === "UNCOMPLETED"
                    ? "Đang xử lý"
                    : "Chờ thanh toán"}
                </span>
              </div>

              <div className="user-order-detail-payment-details">
                <div className="user-order-detail-payment-row">
                  <span className="user-order-detail-payment-label">
                    Tổng đơn
                  </span>
                  <span className="user-order-detail-payment-value">
                    {order?.amount.toLocaleString()}₫
                  </span>
                </div>
                <div className="user-order-detail-payment-row">
                  <span className="user-order-detail-payment-label">
                    Cần thanh toán
                  </span>
                  <span className="user-order-detail-payment-value">
                    {order?.amount.toLocaleString()}₫
                  </span>
                </div>
                <div className="user-order-detail-payment-method-row">
                  <span className="user-order-detail-payment-method-label">
                    Phương thức
                  </span>
                  <span className="user-order-detail-payment-method-text">
                    {paymentMethods.find((m) => m.id === order?.payment)
                      ?.name || "Không rõ"}
                  </span>
                </div>
              </div>
              {order?.status !== "UNCOMPLETED" && (
                <div className="user-order-detail-payment-actions">
                  {paidStatus ? (
                    <button
                      className="user-order-detail-payment-button paid"
                      disabled>
                      Đã thanh toán
                    </button>
                  ) : order?.status === "PROCESSING" ? (
                    <button
                      className="user-order-detail-payment-button cancel"
                      onClick={() => cancelOrder(order.id)}>
                      Hủy đơn hàng
                    </button>
                  ) : order?.payment === "PayPal" ? (
                    <button
                      className="user-order-detail-payment-button"
                      onClick={onclickPay}>
                      Thanh toán
                    </button>
                  ) : order?.payment ? (
                    <button
                      className="user-order-detail-payment-button wait"
                      disabled>
                      Chờ giao hàng
                    </button>
                  ) : null}
                </div>
              )}
            </div>

            <div className="user-order-detail-preparation-info">
              <OrderStatusTag
                status={order?.status}
                des={latestStatus?.status}
              />
              <div className="user-order-detail-shipping-type">
                {latestStatus?.description || "Không có mô tả"}
              </div>
            </div>

            <div className="user-order-detail-shipping-info">
              <div className="user-order-detail-shipping-header">
                <span className="user-order-detail-shipping-title">
                  Địa chỉ nhận hàng
                </span>
              </div>
              <div className="user-order-detail-shipping-details">
                <div className="user-order-detail-shipping-name">
                  <span>{order?.name}</span>
                  <span className="user-order-detail-shipping-phone">
                    {order?.phone}
                  </span>
                </div>
                <p className="user-order-detail-shipping-address">
                  {order?.address}, {order?.fulladdress}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`user-order-detail-right-container ${classNames.right}`}>
        <div ref={rightRef} className="user-order-detail-shadow-container">
          <h2 className="user-order-detail-section-title">Giỏ hàng</h2>
          <div className="user-order-detail-cart-items">
            {cartOrder.length > 0 &&
              cartOrder.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  <div className="user-order-detail-cart-item">
                    <div className="user-order-detail-cart-item-image">
                      <img src={getImageUrl(item.image)} alt={item.id} />
                    </div>
                    <div className="user-order-detail-cart-item-details">
                      <div className="user-order-detail-cart-item-name">
                        {item.name}
                      </div>
                      <div className="user-order-detail-cart-item-variant">
                        {item?.attribute_values
                          .map((attr) => `${attr.attribute_id}: ${attr.id}`)
                          .join(", ")}
                      </div>
                      <div className="user-order-detail-cart-item-prices">
                        <span className="user-order-detail-cart-item-price-discounted">
                          {item.price.toLocaleString()}₫
                        </span>
                      </div>
                      <div className="user-order-detail-cart-item-quantity">
                        x{item.quantity}
                      </div>
                    </div>
                  </div>

                  {item.gift && (
                    <div
                      className="user-cart-item gift"
                      style={{ margin: "15px" }}>
                      <div className="user-cart-item-left">
                        <img
                          src={getImageUrl(item.gift?.image)}
                          alt={item.gift?.product_variant_id}
                          className="user-cart-item-image gift"
                        />
                        <div className="user-cart-item-info">
                          <div className="user-cart-item-name gift">
                            [Quà tặng] {item.gift?.name}
                          </div>
                          <div className="user-cart-item-brand gift">
                            {item.gift?.attribute_values
                              .map((attr) => `${attr.attribute_id}: ${attr.id}`)
                              .join(", ")}
                          </div>

                          <div className="user-cart-item-price">0₫</div>
                        </div>
                      </div>

                      <div className="user-cart-item-right gift">
                        <strong>
                          <FaGift size={18} />
                        </strong>
                        <div className="">Tặng 1</div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
          </div>
        </div>

        <div className="user-order-detail-order-summary">
          <div className="user-order-detail-order-summary-row">
            <span className="user-order-detail-order-summary-label">
              Tổng tiền hàng
            </span>
            <span className="user-order-detail-order-summary-value">
              {order?.amount.toLocaleString()}₫
            </span>
          </div>
          <div className="user-order-detail-order-summary-row">
            <span className="user-order-detail-order-summary-label">
              Phí vận chuyển
            </span>
            <span className="user-order-detail-order-summary-value">
              Miễn phí
            </span>
          </div>
          <div className="user-order-detail-order-summary-row user-order-detail-order-summary-total">
            <span className="user-order-detail-order-summary-label">
              Tổng thanh toán
            </span>
            <span className="user-order-detail-order-summary-value">
              {order?.amount.toLocaleString()}₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
