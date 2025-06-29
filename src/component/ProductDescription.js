import React, { useState } from "react";
import DOMPurify from "dompurify";
import "../css/ProductDescription.css";

const ProductDescription = ({ description, usage, ingredients }) => {
  const [activeTab, setActiveTab] = useState("description");

  const getSanitizedHtml = (html) => {
    return {
      __html: DOMPurify.sanitize(html || ""),
    };
  };

  const renderContent = () => {
    switch (activeTab) {
      case "description":
        return <div dangerouslySetInnerHTML={getSanitizedHtml(description)} />;
      case "usage":
        return <div dangerouslySetInnerHTML={getSanitizedHtml(usage)} />;
      case "ingredients":
        return <div dangerouslySetInnerHTML={getSanitizedHtml(ingredients)} />;
      default:
        return null;
    }
  };

  return (
    <div className="user-product-detail-description-container">
      <div className="user-product-detail-description-tabs">
        <button
          className={`user-product-detail-tab ${
            activeTab === "description" ? "active" : ""
          }`}
          onClick={() => setActiveTab("description")}>
          Mô tả
        </button>
        <button
          className={`user-product-detail-tab ${
            activeTab === "usage" ? "active" : ""
          }`}
          onClick={() => setActiveTab("usage")}>
          Hướng dẫn sử dụng
        </button>
        <button
          className={`user-product-detail-tab ${
            activeTab === "ingredients" ? "active" : ""
          }`}
          onClick={() => setActiveTab("ingredients")}>
          Thành phần
        </button>
      </div>
      <div className="user-product-detail-description-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProductDescription;
