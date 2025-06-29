import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import HomeAdmin from './HomeAdmin';
import ProductAdmin from './ProductAdmin';
import Login from '../../authenticate/Login';
import '../../css/admin/MenuAdmin.css';
import UserAdmin from './UserAdmin';
import OrderAdmin from './OrderAdmin';
import OrderDetailsAdmin from './OrderDetailsAdmin';
import ProductCreation from './ProductCreation';
import ProductDetailsAdmin from './ProductDetailsAdmin';
import AddColorOption from './AddColorOption';
import Logout from '../../authenticate/Logout';

function MenuAdmin() {
  return (
    <div className="admin-container">
     
        {/* Menu cố định bên trái */}
        <nav className="menu-admin">
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                Trang chủ
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/user" className={({ isActive }) => (isActive ? "active" : "")}>
                Xem người dùng
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/product" className={({ isActive }) => (isActive ? "active" : "")}>
                Sản phẩm
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/order" className={({ isActive }) => (isActive ? "active" : "")}>
                Đơn hàng
              </NavLink>
            </li>
            <li>
              <NavLink to="/logout" className={({ isActive }) => (isActive ? "active" : "")}>
                Đăng xuất
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Nội dung thay đổi bên phải */}
        <div className="content">
          <Routes>
            <Route path="/" element={<HomeAdmin />} />
            <Route path="/admin/user" element={<UserAdmin />} />
            <Route path="/admin/product" element={<ProductAdmin />} />
            <Route path="/admin/order" element={<OrderAdmin />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/admin/order/:orderId" element={<OrderDetailsAdmin />} />
            <Route path="/admin/add-product" element={<ProductCreation />} />
            <Route path="/admin/details-product" element={<ProductDetailsAdmin />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </div>
    </div>
  );
}

export default MenuAdmin;
