import { Link, useLocation } from "react-router-dom";

const breadcrumbMap = {
  Cart: "Giỏ hàng",
  logout: "Đăng xuất",
  product: "Sản phẩm",
  checkout: "Thanh toán",
  "order-detail": "Chi tiết đơn hàng",
  buynow: "Mua ngay",
  "product-detail": "Chi tiết sản phẩm",
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav style={{ padding: "1rem" }}>
      <Link to="/">Trang chủ</Link>
      {pathnames.map((segment, index) => {
        const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
        const isLast = index === pathnames.length - 1;
        const label = breadcrumbMap[segment] || segment;

        return (
          <span key={index}>
            {" / "}
            {isLast ? <span>{label}</span> : <Link to={routeTo}>{label}</Link>}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
