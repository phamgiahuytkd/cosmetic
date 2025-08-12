import React, { useState, useEffect } from "react";
import "../css/Checkout.css";
import { FaCheck, FaGift } from "react-icons/fa";
import api from "../service/api";
import { MdDeleteForever } from "react-icons/md";
import { clearBuyNow, getBuyNow, getImageUrl } from "../component/commonFunc";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Typography,
} from "@mui/material";
import {
  PaymentOptionCheckout,
  paymentMethods,
} from "../component/PaymentOptionCheckout";
import AddressModalCheckout from "../component/AddressModalCheckout";
import UserAddAddressModal from "../component/UserAddAddressModal";
import Swal from "sweetalert2";

const BuyNow = () => {
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return "mobile";
    if (/tablet/i.test(ua)) return "tablet";
    return "desktop";
  };

  const [infoUser, setInfoUser] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    fulladdress: "",
    note: "",
    payment: "",
    device: getDeviceType(),
    amount: 0,
    carts: [],
  });
  const [paymentMethod, setPaymentMethod] = useState("bank transfer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [itemBuyNow, setItemBuyNow] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [isAddressInitialized, setIsAddressInitialized] = useState(false);
  const navigate = useNavigate();
  const [previousQuantity, setPreviousQuantity] = useState(1);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get("/user/info");
      setInfoUser(response.data.result);
    } catch (error) {
      console.error(
        "Error fetching user info:",
        error.response?.data?.message || error.message
      );
      toast.error("Không thể tải thông tin người dùng!");
    }
  };

  useEffect(() => {
    return () => {
      clearBuyNow();
    };
  }, []);

  useEffect(() => {
    const item = getBuyNow();
    if (!item) {
      navigate("/Cart");
    } else {
      setItemBuyNow(item);
    }
  }, []);

  useEffect(() => {
    setPreviousQuantity(itemBuyNow.quantity || 1);
  }, [itemBuyNow.quantity]);

  const total = itemBuyNow.product_variant?.price
    ? itemBuyNow.product_variant.price * (itemBuyNow.quantity || 1)
    : 0;

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (infoUser.default_shipping_address && !isAddressInitialized) {
      setFormData((prev) => ({
        ...prev,
        name: infoUser.default_shipping_address.name || "",
        phone:
          infoUser.default_shipping_address.phone || infoUser.phone || "",
        address: infoUser.default_shipping_address.address || "",
        fulladdress: infoUser.default_shipping_address.address_detail || "",
      }));
      setIsAddressInitialized(true);
    }
  }, [infoUser, isAddressInitialized]);

  useEffect(() => {
    if (!itemBuyNow.product_variant?.id) return;

    const carts = [
      {
        product_variant_id: itemBuyNow.product_variant.id,
        quantity: itemBuyNow.quantity || 1,
        price: itemBuyNow.product_variant.price || 0,
        selected_gift_id: itemBuyNow.selectedGift?.id || null,
      },
    ];

    setFormData((prev) => ({
      ...prev,
      payment: paymentMethod,
      amount: total,
      carts,
    }));
  }, [
    itemBuyNow.product_variant,
    itemBuyNow.quantity,
    itemBuyNow.selectedGift,
    paymentMethod,
    total,
  ]);

  const handleInputChange = (fieldId, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: newValue,
    }));
    setError("");
  };

  const handleOpenModal = async () => {
    try {
      const response = await api.get("/address");
      const fetchedAddresses = response.data.result;
      if (!fetchedAddresses || fetchedAddresses.length === 0) {
        toast.error("Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới!");
        setIsModalAddOpen(true);
        return;
      }
      setAddresses(fetchedAddresses);
      setIsModalOpen(true);
    } catch (err) {
      console.error(
        "Error fetching addresses:",
        err.response?.data?.message || err.message
      );
      toast.error("Không thể tải danh sách địa chỉ!");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveAddress = (selectedAddress) => {
    setFormData((prev) => ({
      ...prev,
      name: selectedAddress.name || "",
      phone: selectedAddress.phone || "",
      address: selectedAddress.address || "",
      fulladdress: selectedAddress.address_detail || "",
    }));
    setIsModalOpen(false);
  };

  const handleSubmitAddress = async (newAddress) => {
    try {
      await api.post("/address", {
        name: newAddress.name,
        phone: newAddress.phone,
        address: newAddress.address,
        address_detail: newAddress.address_detail,
        locate: newAddress.locate,
      });
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Bạn đã thêm địa chỉ thành công.",
        confirmButtonText: "OK",
        timer: 2500,
        timerProgressBar: true,
      });
      await fetchUserInfo();
      setIsAddressInitialized(false);
      setIsModalAddOpen(false);
    } catch (err) {
      console.error(err.response?.data?.message || "Lỗi thêm địa chỉ");
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể thêm địa chỉ!",
      });
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (
        !formData.name ||
        !formData.phone ||
        !formData.address ||
        !formData.fulladdress
      ) {
        toast.error("Vui lòng chọn địa chỉ giao hàng!");
        setLoading(false);
        return;
      }

      if (formData.address.split(",").length < 3) {
        toast.error("Địa chỉ phải bao gồm Tỉnh, Huyện, Xã!");
        setLoading(false);
        return;
      }

      if (!formData.carts || formData.carts.length === 0) {
        toast.error("Không có sản phẩm để đặt hàng!");
        setLoading(false);
        return;
      }

      await api.post(`/order/buynow`, formData).then((response) => {
        toast.success("Bạn đã đặt hàng thành công!");
        clearBuyNow();
        navigate(`/order-detail/${response.data.result}`);
      });
    } catch (err) {
      console.error(
        "Error placing order:",
        err.response?.data?.message || err.message
      );
      toast.error("Đặt hàng thất bại! Vui lòng thử lại.");
      setError(
        err.response?.data?.message || "Đặt hàng thất bại! Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const OrderSummary = ({ isMobile = false, total }) => {
    return (
      <div
        className={`user-checkout-order-summary ${isMobile ? "user-checkout-order-summary--mobile" : ""
          }`}
      >
        <div className="user-checkout-order-summary-row">
          <p>Tổng tiền hàng</p>
          <p>{total?.toLocaleString() || "0"}đ</p>
        </div>
        <div className="user-checkout-order-summary-row">
          {/* <p>Phí vận chuyển</p><p>-</p> */}
        </div>
        <div className="user-checkout-order-summary-row">
          <p className="user-checkout-order-summary-total">Tổng thanh toán</p>
          <p className="user-checkout-order-summary-total">
            {total?.toLocaleString() || "0"}đ
          </p>
        </div>
      </div>
    );
  };

  const handleDecrease = () => {
    if (itemBuyNow.quantity > 1) {
      setItemBuyNow((prev) => ({
        ...prev,
        quantity: prev.quantity - 1,
      }));
    }
  };

  const handleIncrease = () => {
    if (itemBuyNow.quantity < (itemBuyNow.product_variant?.stock || Infinity)) {
      setItemBuyNow((prev) => ({
        ...prev,
        quantity: prev.quantity + 1,
      }));
    }
  };

  const testQuantityInputCart = (value, stock, previousValue) => {
    if (value === "" || !/^\d+$/.test(value)) {
      return previousValue;
    }
    const numericValue = parseInt(value, 10);
    if (numericValue < 1) return previousValue;
    if (numericValue > stock) return stock;
    return numericValue;
  };

  return (
    <div className="user-checkout-grid-main-container">
      <div className="user-checkout-left-container">
        <form
          id="hara_checkout_form"
          className="user-checkout-checkout-form"
          onSubmit={handlePlaceOrder}
        >
          <div className="user-checkout-shadow-container">
            <h2 className="user-checkout-text-head">Thông tin giao hàng</h2>
            <div className="user-checkout-info-order">
              {formData.address ? (
                <>
                  <p>
                    <strong>
                      <span>Họ tên</span> <span>:</span>
                    </strong>{" "}
                    {formData.name}
                  </p>
                  <p>
                    <strong>
                      <span>SĐT</span> <span>:</span>
                    </strong>{" "}
                    {formData.phone}
                  </p>
                  <p>
                    <strong>
                      <span>Địa chỉ</span> <span>:</span>
                    </strong>{" "}
                    {formData.address}
                  </p>
                  <p>
                    <strong>
                      <span>Chi tiết</span> <span>:</span>
                    </strong>{" "}
                    {formData.fulladdress}
                  </p>
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button variant="outlined" onClick={handleOpenModal}>
                      Chọn địa chỉ khác
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <div>Bạn chưa có địa chỉ, hãy thêm địa chỉ mặc định.</div>
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setIsModalAddOpen(true)}
                    >
                      Thêm địa chỉ mặc định
                    </Button>
                  </Box>
                </>
              )}
            </div>
          </div>
          <div className="user-checkout-shadow-container">
            <h2 className="user-checkout-text-head">Phương thức thanh toán</h2>
            <div className="user-checkout-payment-methods" role="radiogroup">
              {paymentMethods.map((method) => (
                <PaymentOptionCheckout
                  key={method.id}
                  method={method}
                  selected={paymentMethod === method.id}
                  onSelect={setPaymentMethod}
                />
              ))}
            </div>
          </div>
          <div className="user-checkout-shadow-container">
            <div className="user-checkout-input-group">
              <textarea
                className="user-checkout-note-textarea"
                id="note"
                placeholder="Ghi chú đơn hàng"
                value={formData.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className="user-checkout-shadow-container user-checkout-order-summary--mobile">
            <h2 className="user-checkout-text-head">Tóm tắt đơn hàng</h2>
            <OrderSummary isMobile total={total} />
          </div>
        </form>
      </div>
      <div className="user-checkout-right-container">
        <div className="user-checkout-shadow-container">
          <h2 className="user-checkout-text-head">Sản phẩm</h2>
          {itemBuyNow.product_variant && (
            <div className="user-cart-item" key={itemBuyNow.product_variant.id}>
              <div className="user-cart-item-left">
                <img
                  src={getImageUrl(itemBuyNow.product_variant.image)}
                  alt={itemBuyNow.product_variant.id}
                  className="user-cart-item-image"
                />
                <div className="user-cart-item-info">
                  <div className="user-cart-item-name">
                    {itemBuyNow.product_variant.name}
                  </div>
                  <div className="user-cart-item-brand">
                    {itemBuyNow.brand_id}
                  </div>
                  <div className="user-cart-item-price">
                    {itemBuyNow.product_variant.price?.toLocaleString()}₫
                    {itemBuyNow.product_variant.percent != null &&
                      itemBuyNow.product_variant.percent > 0 && (
                        <span className="user-cart-item-original-price">
                          {(
                            itemBuyNow.product_variant.price /
                            (1 - itemBuyNow.product_variant.percent / 100)
                          )?.toLocaleString()}
                          ₫
                        </span>
                      )}
                  </div>
                </div>
              </div>
              <div className="user-cart-item-right">
                <strong>{total?.toLocaleString()}₫</strong>
                <div className="user-cart-quantity-control">
                  <button onClick={handleDecrease}>-</button>
                  <input
                    name={itemBuyNow.product_variant.id}
                    value={itemBuyNow.quantity ?? ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (
                        newValue === "" ||
                        (/^\d+$/.test(newValue) && parseInt(newValue) > 0)
                      ) {
                        setItemBuyNow((prev) => ({
                          ...prev,
                          quantity: newValue,
                        }));
                      }
                    }}
                    onBlur={(e) => {
                      const newValue = e.target.value;
                      const validValue = testQuantityInputCart(
                        newValue,
                        itemBuyNow.product_variant.stock || Infinity,
                        previousQuantity
                      );
                      setItemBuyNow((prev) => ({
                        ...prev,
                        quantity: validValue,
                      }));
                    }}
                    onMouseLeave={(e) => {
                      const newValue = e.target.value;
                      const validValue = testQuantityInputCart(
                        newValue,
                        itemBuyNow.product_variant.stock || Infinity,
                        previousQuantity
                      );
                      setItemBuyNow((prev) => ({
                        ...prev,
                        quantity: validValue,
                      }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const newValue = e.target.value;
                        const validValue = testQuantityInputCart(
                          newValue,
                          itemBuyNow.product_variant.stock || Infinity,
                          previousQuantity
                        );
                        setItemBuyNow((prev) => ({
                          ...prev,
                          quantity: validValue,
                        }));
                        e.target.blur();
                      }
                    }}
                  />
                  <button onClick={handleIncrease}>+</button>
                </div>
              </div>
            </div>
          )}
          {itemBuyNow.selectedGift && (
            <div className="user-cart-item gift" style={{ margin: "15px" }}>
              <div className="user-cart-item-left">
                <img
                  src={getImageUrl(itemBuyNow.selectedGift?.image)}
                  alt={itemBuyNow.selectedGift?.product_variant_id}
                  className="user-cart-item-image gift"
                />
                <div className="user-cart-item-info">
                  <div className="user-cart-item-name gift">
                    [Quà tặng] {itemBuyNow.selectedGift?.name}
                  </div>
                  <div className="user-cart-item-brand gift">
                    {itemBuyNow.selectedGift?.attribute_values
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
        </div>
        <div className="user-checkout-shadow-container">
          <h2 className="user-checkout-text-head">Tóm tắt đơn hàng</h2>
          <OrderSummary total={total} />
          <div className="user-checkout-place-order">
            <button
              className="user-checkout-place-order-button"
              type="submit"
              form="hara_checkout_form"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
          {error && <p className="user-checkout-error-message">{error}</p>}
        </div>
      </div>
      <AddressModalCheckout
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAddress}
        addresses={addresses}
        defaultAddressId={infoUser.default_shipping_address?.id}
        navigate={navigate}
        setIsModalAddOpen={setIsModalAddOpen}
      />
      <UserAddAddressModal
        isOpen={isModalAddOpen}
        onClose={() => setIsModalAddOpen(false)}
        onSave={handleSubmitAddress}
      />
    </div>
  );
};

export default BuyNow;