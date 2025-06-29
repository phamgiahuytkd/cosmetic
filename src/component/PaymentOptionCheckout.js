import { FaCheck } from "react-icons/fa";

export const PaymentOptionCheckout = ({ method, selected, onSelect }) => (
  <label
    className={`user-checkout-payment-option ${
      selected ? "user-checkout-payment-option--selected" : ""
    }`}
    onClick={() => onSelect(method.id)}>
    <input
      type="radio"
      name="paymentMethodId"
      value={method.id}
      checked={selected}
      onChange={() => {}}
      style={{ display: "none" }}
    />
    <span className="user-checkout-payment-radio">
      <span className="user-checkout-payment-radio-inner">
        {selected && <FaCheck />}
      </span>
    </span>
    <div className="user-checkout-payment-option-content">
      <img
        className="user-checkout-payment-option-icon"
        src={method.icon}
        alt={method.name}
      />
      <div>
        <div>{method.name}</div>
        {method.subIcons && (
          <div className="user-checkout-payment-option-subicons">
            {method.subIcons.map((icon, idx) => (
              <img key={idx} src={icon} alt={`Icon ${idx + 1}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  </label>
);


export const paymentMethods = [
  {
    id: "PayPal",
    name: "Thanh toán bằng MoMo",
    icon: "https://cdn.brandfetch.io/idn4xaCzTm/w/180/h/180/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    id: "bank transfer",
    name: "Thanh toán sau khi nhận hàng",
    icon: "https://hstatic.net/0/0/global/design/seller/image/payment/other.svg?v=4",
  },
];



