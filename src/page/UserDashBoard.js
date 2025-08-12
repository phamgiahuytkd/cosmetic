// UserDashboard.js
import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import "../css/UserDashboard.css";
import { getImageUrl, handleLogoutConfirm } from "../component/commonFunc";
import { useUser } from "../component/UserContext";

const UserDashboard = () => {
  const { user } = useUser();

  return (
    <div className="user-dash-board-container">
      <aside className="user-dash-board-sidebar">
        <div className="user-dash-board-user">
          <img
            src={user?.avatar ? getImageUrl(user?.avatar) : "/image/default-avatar-profile.jpg"}
            alt="Avatar"
            className="user-dash-board-avatar"
          />
          <span className="user-dash-board-username">{user?.full_name}</span>
        </div>
        <nav className="user-dash-board-nav">
          <NavLink
            to="info"
            className={({ isActive }) =>
              `user-dash-board-link ${isActive ? "active" : ""}`
            }>
            Thông tin cá nhân
          </NavLink>
          <NavLink
            to="orders"
            className={({ isActive }) =>
              `user-dash-board-link ${isActive ? "active" : ""}`
            }>
            Đơn hàng
          </NavLink>
          <NavLink
            to="rating"
            className={({ isActive }) =>
              `user-dash-board-link ${isActive ? "active" : ""}`
            }>
            Đánh giá
          </NavLink>
          <NavLink
            onClick={handleLogoutConfirm}
            className={`user-dash-board-logout`}>
            Đăng xuất
          </NavLink>
        </nav>
      </aside>
      <main className="user-dash-board-content">
        <Outlet />
      </main>
    </div>
  );
};

export default UserDashboard;
