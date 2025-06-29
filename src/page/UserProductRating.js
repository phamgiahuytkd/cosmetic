import React, { useState } from "react";
import "../css/UserInfo.css";
import UserWaitRating from "./UserWaitRating";
import UserRated from "./UserRated";



const UserProductRating = () => {
  const [activeTab, setActiveTab] = useState("unrating");

  const renderContent = () => {
    switch (activeTab) {
      case "unrating":
        return <UserWaitRating />;
      case "rated":
        return <UserRated />;
      default:
        return null;
    }
  };

  return (
    <div className="user-detail-info-container">
      <div className="user-detail-info-tabs">
        <button
          className={`user-detail-tab ${
            activeTab === "unrating" ? "active" : ""
          }`}
          onClick={() => setActiveTab("unrating")}>
          Chưa đánh giá
        </button>
        <button
          className={`user-detail-tab ${activeTab === "rated" ? "active" : ""}`}
          onClick={() => setActiveTab("rated")}>
          Đã đánh giá
        </button>
      </div>
      <div className="user-detail-info-content">{renderContent()}</div>
    </div>
  );
};

export default UserProductRating;
