import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import { FcLike } from "react-icons/fc";
import { GiShoppingBag } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { useBrandCategory } from "./BrandCategoryContext";
import { useCart } from "./CartContext";
import { FaRegGrinStars, FaUser, FaUserCog, FaUserEdit } from "react-icons/fa";
import { useUser } from "./UserContext";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { RiBillLine } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { getImageUrl, handleLogoutConfirm } from "./commonFunc";

const MenuDesktop = ({ setOpenModal }) => {
  const token = localStorage.getItem("token");
  let role = null;
  if (token) {
    const decodedToken = jwtDecode(token);
    role = decodedToken.scope;
  }

  const [isHoveringMenu, setIsHoveringMenu] = useState(false);
  const { cartCount } = useCart();
  const { brands, categories, loading } = useBrandCategory();
  const { user } = useUser();
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim() !== "") {
      navigate(`/product?search=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <nav className={`menu-user ${isHoveringMenu ? "hovered" : ""}`}>
      <div className="menu-user-left">
        <Link to="/">
          <img
            src={
              "/z6575119271173_4013092750fef932771162ce626270fa-removebg-preview.png"
            }
            alt="logo"
          />
        </Link>
      </div>

      <div className="menu-user-right">
        <div className="menu-user-tool">
          <form className="search-input-wrapper" onSubmit={handleSearch}>
            <input
              type="text"
              className="seach"
              placeholder="Tìm kiếm ..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="search-btn" type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>

          {role === "USER" ? (
            <ul className="menu-user-account">
              <li>
                <Link onClick={() => setOpenModal(true)}>
                  <FcLike className="menu-user-tool-icon" />
                  <span>Yêu thích</span>
                </Link>
              </li>
              <li>
                <Link to="/Cart">
                  <GiShoppingBag className="menu-user-tool-icon" />
                  <div className="cart-icon-wrapper">
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </div>
                  <span>Giỏ hàng</span>
                </Link>
              </li>
              <li
                onMouseEnter={() => setIsHoveringMenu(true)}
                onMouseLeave={() => setIsHoveringMenu(false)}>
                <Link to="/Cart">
                  <FaUserCog className="menu-user-tool-icon" />
                  <span>Tài khoản</span>
                </Link>
                <ul>
                  <div className="menu-user-account-tool">
                    <h4>
                      <p>{user?.full_name}</p>{" "}
                      <img
                        src={user?.avatar ? getImageUrl(user?.avatar) : "/image/default-avatar-profile.jpg"}
                        alt={user?.full_name}
                      />
                    </h4>
                    <li>
                      <Link to="/dashboard/info">
                        <span>Thông tin tài khoản</span>
                        <IoIosInformationCircleOutline className="menu-user-tool-icon" />
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard/orders">
                        <span>Đơn hàng</span>
                        <RiBillLine className="menu-user-tool-icon" />
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard/rating">
                        <span>Đánh giá</span>
                        <FaRegGrinStars className="menu-user-tool-icon" />
                      </Link>
                    </li>
                    <li>
                      <Link onClick={handleLogoutConfirm}>ĐĂNG XUẤT</Link>
                    </li>
                  </div>
                </ul>
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                <Link to="/auth/login">
                  <FaUser className="menu-user-tool-icon" />
                  <span>Đăng nhập</span>
                </Link>
              </li>

              <li>
                <Link to="/auth/signup">
                  <FaUserEdit className="menu-user-tool-icon" size={23} />
                  <span>Đăng ký</span>
                </Link>
              </li>
            </ul>
          )}
        </div>

        <ul className="menu-user-list">
          <li>
            <Link to="/">Trang chủ</Link>
          </li>
          <li>
            <Link to="/product?reset=true">Sản phẩm</Link>
          </li>

          <li
            onMouseEnter={() => setIsHoveringMenu(true)}
            onMouseLeave={() => setIsHoveringMenu(false)}>
            <span>Danh mục </span> <MdKeyboardArrowDown />
            <ul>
              <div>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link to={`/product?category=${category.id}`}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </div>
            </ul>
          </li>

          <li
            onMouseEnter={() => setIsHoveringMenu(true)}
            onMouseLeave={() => setIsHoveringMenu(false)}>
            <span>Thương hiệu</span> <MdKeyboardArrowDown />
            <ul>
              <div>
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <Link to={`/product?brand=${brand.id}`}>{brand.name}</Link>
                  </li>
                ))}
              </div>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default MenuDesktop;
