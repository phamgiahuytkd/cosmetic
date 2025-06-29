import React, { useState } from "react";
import "../css/UserInfo.css";
import UserProfile from "./UserProfile";
import UserAddress from "./UserAddress";
import UserSecurity from "./UserSecurity";



const UserInfo = () => {
  const [activeTab, setActiveTab] = useState("info");

  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <UserProfile />
        );
      case "address":
        return <UserAddress />;
      case "security":
        return <UserSecurity />;
      default:
        return null;
    }
  };

  return (
    <div className="user-detail-info-container">
      <div className="user-detail-info-tabs">
        <button
          className={`user-detail-tab ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}>
          Thông tin
        </button>
        <button
          className={`user-detail-tab ${
            activeTab === "address" ? "active" : ""
          }`}
          onClick={() => setActiveTab("address")}>
          Địa chỉ
        </button>
        <button
          className={`user-detail-tab ${
            activeTab === "security" ? "active" : ""
          }`}
          onClick={() => setActiveTab("security")}>
          Bảo mật
        </button>
      </div>
      <div className="user-detail-info-content">{renderContent()}</div>
    </div>
  );
};

export default UserInfo;
