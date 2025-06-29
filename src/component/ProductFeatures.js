import { RiSecurePaymentLine } from "react-icons/ri";
import { TbArrowBackUp, TbTruckDelivery } from "react-icons/tb";
import "../css/ProductFeatures.css";

const ProductFeatures = () => {
  return (
    <section className="user-product-detail-features-container">
      <div className="user-product-detail-features-grid">
        <div className="user-product-detail-feature-item">
          <div className="user-product-detail-feature-icon">
            <TbArrowBackUp className="user-product-detail-icon-return" />
          </div>
          <div>
            <h4 className="user-product-detail-feature-title">
              Đổi trả dễ dàng
            </h4>
            <p className="user-product-detail-feature-description">
              Hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm bị lỗi hoặc không
              đúng mô tả.
            </p>
          </div>
        </div>

        <div className="user-product-detail-feature-item">
          <div className="user-product-detail-feature-icon">
            <TbTruckDelivery className="user-product-detail-icon-delivery" />
          </div>
          <div>
            <h4 className="user-product-detail-feature-title">
              Giao hàng nhanh chóng
            </h4>
            <p className="user-product-detail-feature-description">
              Giao hàng toàn quốc chỉ từ 1–3 ngày làm việc, theo dõi đơn hàng dễ
              dàng.
            </p>
          </div>
        </div>

        <div className="user-product-detail-feature-item">
          <div className="user-product-detail-feature-icon">
            <RiSecurePaymentLine className="user-product-detail-icon-payment" />
          </div>
          <div>
            <h4 className="user-product-detail-feature-title">
              Thanh toán an toàn
            </h4>
            <p className="user-product-detail-feature-description">
              Hỗ trợ nhiều phương thức thanh toán bảo mật, tiện lợi và nhanh
              chóng.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};



export default ProductFeatures;