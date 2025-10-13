import React, { useState, useEffect } from "react";
import "../css/Checkout.css";
import { FaCheck, FaGift } from "react-icons/fa";
import api from "../service/api";
import { useCart } from "../component/CartContext";
import { useUser } from "../component/UserContext";
import { MdDeleteForever } from "react-icons/md";
import { getImageUrl } from "../component/commonFunc";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";
import AddressModalCheckout from "../component/AddressModalCheckout";
import {
  PaymentOptionCheckout,
  paymentMethods,
} from "../component/PaymentOptionCheckout";
import UserAddAddressModal from "../component/UserAddAddressModal";
import VoucherSelector from "../component/VoucherSelector"; // Import component mới

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, fetchCart } = useCart();
  const { voucher, user, fetchUser } = useUser();
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
    address_id: null,
    note: "",
    payment: "",
    device: getDeviceType(),
    amount: 0,
    voucher_id: null,
  });
  const [paymentMethod, setPaymentMethod] = useState("bank transfer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatedIndex, setUpdatedIndex] = useState(null);
  const [itemsInCart, setItemsInCart] = useState([]);
  const [tempQuantities, setTempQuantities] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isAddressInitialized, setIsAddressInitialized] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

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
    if (cartItems.length === 0) {
      navigate("/Cart");
    }
  }, [cartItems, navigate]);

  const total = itemsInCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const calculateDiscountedTotal = () => {
    if (!selectedVoucher) return total;

    if (total < selectedVoucher.min_order_amount) {
      toast.error(
        `Đơn hàng phải có giá trị tối thiểu ${selectedVoucher.min_order_amount.toLocaleString()}đ để áp dụng voucher!`
      );
      setSelectedVoucher(null);
      setFormData((prev) => ({ ...prev, voucher_id: null }));
      return total;
    }

    if (
      selectedVoucher.used_count >= selectedVoucher.usage_limit ||
      new Date(selectedVoucher.end_day) < new Date()
    ) {
      toast.error("Voucher đã hết hạn hoặc đã sử dụng hết!");
      setSelectedVoucher(null);
      setFormData((prev) => ({ ...prev, voucher_id: null }));
      return total;
    }

    let discount = 0;
    if (selectedVoucher.voucher_type === "PERCENTAGE") {
      discount = Math.min(
        (total * selectedVoucher.percent) / 100,
        selectedVoucher.max_amount
      );
    } else {
      discount = selectedVoucher.max_amount;
    }
    return total - discount;
  };

  const discountedTotal = calculateDiscountedTotal();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (infoUser.default_shipping_address && !isAddressInitialized) {
      const defaultAddress = infoUser.default_shipping_address;
      setFormData((prev) => ({
        ...prev,
        name: defaultAddress.name || "",
        phone: defaultAddress.phone || infoUser.phone || "",
        address: defaultAddress.address || "",
        fulladdress:
          defaultAddress.address_detail || defaultAddress.address || "",
        address_id: defaultAddress.id || null,
      }));
      setIsAddressInitialized(true);
    }
  }, [infoUser, isAddressInitialized]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      payment: paymentMethod,
      amount: discountedTotal,
      voucher_id: selectedVoucher ? selectedVoucher.id : null,
    }));
  }, [paymentMethod, discountedTotal, selectedVoucher]);

  useEffect(() => {
    setItemsInCart(cartItems);
    const initQuantities = {};
    cartItems.forEach((item, index) => {
      initQuantities[index] = item.quantity.toString();
    });
    setTempQuantities(initQuantities);
  }, [cartItems]);

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
        navigate("/user/address/add");
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

  const handleOpenVoucherModal = () => {
    if (!voucher || voucher.length === 0) {
      toast.error("Bạn chưa có mã giảm giá nào!");
      return;
    }
    setIsVoucherModalOpen(true);
  };

  const handleCloseVoucherModal = () => {
    setIsVoucherModalOpen(false);
  };

  const handleSaveAddress = (selectedAddress) => {
    setFormData((prev) => ({
      ...prev,
      name: selectedAddress.name || "",
      phone: selectedAddress.phone || "",
      address: selectedAddress.address || "",
      fulladdress:
        selectedAddress.address_detail || selectedAddress.address || "",
      address_id: selectedAddress.id || null,
    }));
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

  const handleSelectVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setIsVoucherModalOpen(false);
  };

  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    setFormData((prev) => ({ ...prev, voucher_id: null }));
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
        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng!");
        setLoading(false);
        return;
      }

      if (!formData.fulladdress?.trim()) {
        toast.error("Địa chỉ không được để trống!");
        setLoading(false);
        return;
      }

      if (!(itemsInCart.length > 0)) {
        toast.error("Bạn không có sản phẩm nào trong giỏ hàng!");
        setLoading(false);
        return;
      }

      if (formData.voucher_id?.trim() && user.reputation < 100) {
        toast.error("Bạn không thể dùng mã khi uy tín dưới 100!");
        setLoading(false);
        return;
      }

      const orderPayload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        fulladdress: formData.fulladdress,
        address_id: formData.address_id,
        note: formData.note,
        payment: formData.payment,
        device: formData.device,
        amount: formData.amount,
        voucher_id: formData.voucher_id,
      };
      const response = await api.post("/order", orderPayload);
      Swal.fire({
        icon: "success",
        title: "Đặt hàng thành công",
        text: "Bạn đã đặt hàng thành công!",
      });
      fetchCart();
      fetchUser();
      navigate(`/order-detail/${response.data.result}`);
    } catch (err) {
      console.error(
        "Error placing order:",
        err.response?.data?.message || err.message
      );
      const errorMessage =
        err.response?.data?.message ||
        "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!";
      Swal.fire({
        icon: "error",
        title: "Đặt hàng thất bại",
        text: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = (item) => {
    api
      .put(`/cart/${item.id}`, { quantity: item.quantity })
      .then(() => fetchCart())
      .catch((err) =>
        console.error("Lỗi cập nhật:", err.response?.data?.message)
      );
  };

  const handleDecrease = (index) => {
    const updatedItems = [...itemsInCart];
    if (updatedItems[index].quantity > 1) {
      updatedItems[index].quantity -= 1;
      setItemsInCart(updatedItems);
      setTempQuantities((prev) => ({
        ...prev,
        [index]: updatedItems[index].quantity.toString(),
      }));
      setUpdatedIndex(index);
    }
  };

  const handleIncrease = (index) => {
    const updatedItems = [...itemsInCart];
    if (updatedItems[index].quantity < updatedItems[index].stock) {
      updatedItems[index].quantity += 1;
      setItemsInCart(updatedItems);
      setTempQuantities((prev) => ({
        ...prev,
        [index]: updatedItems[index].quantity.toString(),
      }));
      setUpdatedIndex(index);
    }
  };

  const testQuantityInput = (index, value, itemsInCart) => {
    const item = itemsInCart[index];
    const stock = item?.stock ?? 0;
    const currentQuantity = item?.quantity ?? 1;

    if (!/^\d+$/.test(value)) {
      return currentQuantity;
    }

    const numericValue = parseInt(value, 10);

    if (numericValue < 1) {
      return currentQuantity;
    }

    if (numericValue > stock) {
      return stock;
    }

    return numericValue;
  };

  const OrderSummary = ({ isMobile = false, total, discountedTotal }) => {
    return (
      <div
        className={`user-checkout-order-summary ${
          isMobile ? "user-checkout-order-summary--mobile" : ""
        }`}>
        <div className="user-checkout-order-summary-row">
          <p>Tổng tiền hàng</p>
          <p>{total ? total.toLocaleString() : "0"}đ</p>
        </div>
        {selectedVoucher && (
          <div className="user-checkout-order-summary-row promo">
            <p>Giảm giá ({selectedVoucher.code})</p>
            <p>-{(total - discountedTotal).toLocaleString()}đ</p>
          </div>
        )}
        <div className="user-checkout-order-summary-row">
          <p className="user-checkout-order-summary-total">Tổng thanh toán</p>
          <p className="user-checkout-order-summary-total">
            {discountedTotal ? discountedTotal.toLocaleString() : "0"}đ
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="user-checkout-grid-main-container">
      <div className="user-checkout-left-container">
        <form
          id="hara_checkout"
          className="user-checkout-checkout-form"
          onSubmit={handlePlaceOrder}>
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
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button variant="outlined" onClick={handleOpenModal}>
                      Chọn địa chỉ khác
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <div>Bạn chưa có địa chỉ, hãy thêm địa chỉ mặc định.</div>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setIsModalAddOpen(true)}>
                      Thêm địa chỉ mặc định
                    </Button>
                  </Box>
                </>
              )}
            </div>
          </div>
          <div className="user-checkout-shadow-container">
            <h2 className="user-checkout-text-head">Mã giảm giá</h2>
            <div className="user-checkout-coupon-section">
              {selectedVoucher ? (
                <div className="user-checkout-coupon-discount">
                  <FaCheck size={16} />
                  <span>{selectedVoucher.code}</span>
                  <span>-{(total - discountedTotal).toLocaleString()}đ</span>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleRemoveVoucher}
                    sx={{ color: "#e11d48" }}>
                    Xóa
                  </Button>
                </div>
              ) : (
                <Button
                  className="user-checkout-coupon-button"
                  onClick={handleOpenVoucherModal}>
                  <div className="user-checkout-coupon-button-content">
                    <FaGift size={16} />
                    <span>Chọn mã giảm giá</span>
                  </div>
                </Button>
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
                onChange={(e) =>
                  handleInputChange("note", e.target.value)
                }></textarea>
            </div>
          </div>
          <div className="user-checkout-shadow-container user-checkout-order-summary--mobile">
            <h2 className="user-checkout-text-head">Tóm tắt đơn hàng</h2>
            <OrderSummary
              isMobile
              total={total}
              discountedTotal={discountedTotal}
            />
          </div>
        </form>
        {error && <p className="user-checkout-error-message">{error}</p>}
      </div>
      <div className="user-checkout-right-container">
        <div className="user-checkout-shadow-container">
          <h2 className="user-checkout-text-head">Giỏ hàng</h2>
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <>
                <div
                  className="user-cart-item"
                  key={index}
                  onMouseLeave={() => {
                    if (updatedIndex === index) {
                      updateCartItem(cartItems[index]);
                      setUpdatedIndex(null);
                    }
                  }}>
                  <div className="user-cart-item-left">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.id}
                      className="user-cart-item-image"
                    />
                    <div className="user-cart-item-info">
                      <div className="user-cart-item-name">{item.name}</div>
                      <div className="user-cart-item-brand">
                        {item.brand_id}
                      </div>
                      <div className="user-cart-item-price">
                        {item.price.toLocaleString()}₫
                        {item.percent != null && item.percent > 0 && (
                          <span className="user-cart-item-original-price">
                            {(
                              item.price /
                              (1 - item.percent / 100)
                            ).toLocaleString()}
                            ₫
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="user-cart-item-right">
                    <strong>
                      {(item.price * item.quantity).toLocaleString()}₫
                    </strong>
                    <div className="user-cart-quantity-control">
                      <button onClick={() => handleDecrease(index)}>-</button>
                      <input
                        name={item.id}
                        value={tempQuantities[index] ?? item.quantity}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setTempQuantities((prev) => ({
                            ...prev,
                            [index]: newValue,
                          }));
                        }}
                        onMouseLeave={(e) => {
                          const validValue = testQuantityInput(
                            index,
                            e.target.value,
                            itemsInCart
                          );
                          const updatedItems = [...itemsInCart];
                          updatedItems[index].quantity = validValue;
                          setItemsInCart(updatedItems);
                          setTempQuantities((prev) => ({
                            ...prev,
                            [index]: validValue.toString(),
                          }));
                          setUpdatedIndex(index);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const validValue = testQuantityInput(
                              index,
                              e.target.value,
                              itemsInCart
                            );
                            const updatedItems = [...itemsInCart];
                            updatedItems[index].quantity = validValue;
                            setItemsInCart(updatedItems);
                            setTempQuantities((prev) => ({
                              ...prev,
                              [index]: validValue.toString(),
                            }));
                            setUpdatedIndex(index);
                            e.target.blur();
                          }
                        }}
                      />
                      <button onClick={() => handleIncrease(index)}>+</button>
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
              </>
            ))
          ) : (
            <p>Giỏ hàng trống</p>
          )}
        </div>
        <div className="user-checkout-shadow-container">
          <h2 className="user-checkout-text-head">Tóm tắt đơn hàng</h2>
          <OrderSummary total={total} discountedTotal={discountedTotal} />
          <div className="user-checkout-place-order">
            <button
              className="user-checkout-place-order-button"
              type="submit"
              form="hara_checkout"
              disabled={loading}>
              {loading ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
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
      <VoucherSelector
        open={isVoucherModalOpen}
        onClose={handleCloseVoucherModal}
        vouchers={voucher}
        onSelectVoucher={handleSelectVoucher}
        selectedVoucher={selectedVoucher}
        totalOrderAmount={total}
      />
    </div>
  );
};

export default Checkout;
