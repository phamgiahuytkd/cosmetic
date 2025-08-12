import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { FcLike } from "react-icons/fc";
import { GiShoppingBag } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { useBrandCategory } from "./BrandCategoryContext";
import { useCart } from "./CartContext";
import { useUser } from "./UserContext";
import { FaRegGrinStars, FaUser, FaUserEdit } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { RiBillLine } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaBars } from "react-icons/fa";
import { getImageUrl, handleLogoutConfirm } from "./commonFunc";
import "../css/MenuMobile.css";

const MenuMobile = ({ setOpenModal }) => {
  const token = localStorage.getItem("token");
  let role = null;
  if (token) {
    const decodedToken = jwtDecode(token);
    role = decodedToken.scope;
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menu hiển thị ngay từ đầu
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [menuActive, setMenuActive] = useState(false); // Active mặc định để hiển thị ngay
  const [accountMenuActive, setAccountMenuActive] = useState(false);
  const { cartCount } = useCart();
  const { brands, categories } = useBrandCategory();
  const { user } = useUser();
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim() !== "") {
      navigate(`/product?search=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAccountMenu = () => {
    setIsAccountOpen(!isAccountOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      const timer = setTimeout(() => setMenuActive(true), 10);
      return () => clearTimeout(timer);
    } else {
      setMenuActive(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isAccountOpen) {
      const timer = setTimeout(() => setAccountMenuActive(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAccountMenuActive(false);
    }
  }, [isAccountOpen]);

  return (
    <nav className="user-menu-mobile">
      <div className="user-menu-mobile-container">
        <div className="user-menu-mobile-left">
          <button className="user-menu-mobile-hamburger" onClick={toggleMenu}>
            <FaBars />
          </button>
          <Link to="/">
            <img
              src="/z6575119271173_4013092750fef932771162ce626270fa-removebg-preview.png"
              alt="logo"
              className="user-menu-mobile-logo"
            />
          </Link>
        </div>

        <div className="user-menu-mobile-right">
          <form
            className="user-menu-mobile-search-wrapper"
            onSubmit={handleSearch}>
            <input
              type="text"
              className="user-menu-mobile-search"
              placeholder="Tìm kiếm ..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="user-menu-mobile-search-btn" type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>

          <ul className="user-menu-mobile-tools">
            {role === "USER" ? (
              <>
                <li>
                  <Link onClick={() => setOpenModal(true)}>
                    <FcLike className="user-menu-mobile-tool-icon" />
                  </Link>
                </li>
                <li>
                  <Link to="/Cart">
                    <GiShoppingBag className="user-menu-mobile-tool-icon" />
                    {cartCount > 0 && (
                      <span className="user-menu-mobile-cart-badge">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </li>
                <li
                  onClick={toggleAccountMenu}
                  className="user-menu-mobile-account">
                  <img
                    src={user?.avatar ? getImageUrl(user?.avatar) : "/image/default-avatar-profile.jpg"}
                    alt={user?.full_name}
                    className="user-menu-mobile-avatar"
                  />
                  <ul
                    className={`user-menu-mobile-account-submenu ${accountMenuActive ? "active" : ""
                      }`}>
                    <div className="user-menu-mobile-account-tool">
                      <h4>
                        <p>{user?.full_name}</p>
                      </h4>
                      <li>
                        <Link to="/dashboard/info">
                          <span>Thông tin tài khoản</span>
                          <IoIosInformationCircleOutline className="user-menu-mobile-tool-icon" />
                        </Link>
                      </li>
                      <li>
                        <Link to="/dashboard/orders">
                          <span>Đơn hàng</span>
                          <RiBillLine className="user-menu-mobile-tool-icon" />
                        </Link>
                      </li>
                      <li>
                        <Link to="/dashboard/rating">
                          <span>Đánh giá</span>
                          <FaRegGrinStars className="user-menu-mobile-tool-icon" />
                        </Link>
                      </li>
                      <li>
                        <Link onClick={handleLogoutConfirm}>ĐĂNG XUẤT</Link>
                      </li>
                    </div>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/auth/login">
                    <FaUser className="user-menu-mobile-tool-icon" />
                  </Link>
                </li>
                <li>
                  <Link to="/auth/signup">
                    <FaUserEdit
                      className="user-menu-mobile-tool-icon"
                      size={30}
                    />
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <ul className={`user-menu-mobile-list ${menuActive ? "active" : ""}`}>
        <li>
          <Link to="/">Trang chủ</Link>
        </li>
        <li>
          <Link to="/product?reset=true">Sản phẩm</Link>
        </li>
        <li className={isCategoryOpen ? "open" : ""}>
          <span onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
            Danh mục <MdKeyboardArrowDown />
          </span>
          {isCategoryOpen && (
            <ul className="user-menu-mobile-submenu">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link to={`/product?category=${category.id}`}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li className={isBrandOpen ? "open" : ""}>
          <span onClick={() => setIsBrandOpen(!isBrandOpen)}>
            Thương hiệu <MdKeyboardArrowDown />
          </span>
          {isBrandOpen && (
            <ul className="user-menu-mobile-submenu">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <Link to={`/product?brand=${brand.name}`}>
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default MenuMobile;
