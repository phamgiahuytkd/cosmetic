// src/components/UserFavoriteModal.js
import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const FavoriteModal = ({ isOpen, onClose, children }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="user-product-favorite-modal"
      overlayClassName="user-product-favorite-overlay"
      closeTimeoutMS={300}>
      <div className="user-product-favorite-modal-content">
        <h2>
          DANH MỤC SẢN PHẨM YÊU THÍCH
          <button className="user-product-favorite-close" onClick={onClose}>
            &times;
          </button>
        </h2>
        {children}
      </div>
    </Modal>
  );
};

export default FavoriteModal;
