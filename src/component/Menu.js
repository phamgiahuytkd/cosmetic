import "../css/Menu.css";
import "../css/common.css";

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Logout from "../authenticate/Logout";
import { useCart } from "./CartContext";
import { GiClover } from "react-icons/gi";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";
import "../css/FavoriteModal.css";
import { useFavorites } from "./FavoriteContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";

// Đừng quên import CSS Swiper
import "swiper/css";
import "swiper/css/mousewheel";
import {
  formatPrice,
  getImageUrl,
  handleAddToCart,
  handleRemoveToLove,
  isNewProduct,
} from "./commonFunc";
import { IoBagAdd } from "react-icons/io5";
import FloatingToolbar from "./FloatingToolbar";
import Home from "../page/Home";
import Cart from "../page/Cart";
import Product from "../page/Product";
import Checkout from "../page/Checkout";
import OrderDetail from "../page/OrderDetail";
import BuyNow from "../page/BuyNow";
import UserProductDetail from "../page/UserProductDetail";
import FavoriteModal from "./FavoriteModal";
import ScrollToTop from "./ScrollToTop ";
import MenuDesktop from "./MenuDesktop";
import ProductDetail from "../page/ProductDetail";
import Breadcrumbs from "./Breadcrumbs";
import ProductCard from "./ProductCard";
import AddAndBuyNowModel from "./AddAndBuyNowModel";
import { useAddAndBuyNowModal } from "./AddAndBuyNowModalContext";
import UserDashboard from "../page/UserDashBoard";
import UserInfo from "../page/UserInfo";
import UserOrders from "../page/UserOrders";
import MomoReturn from "../page/MomoReturn";
import UserProductRating from "../page/UserProductRating";
import MenuMobile from "./MenuMobile";

export function Menu() {
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const {
    favoriteIdSet,
    fetchFavorites,
    favoriteItems,
    openLoveModal,
    setOpenLoveModal,
  } = useFavorites();
  const {
    openAddAndBuyNowModal,
    setOpenAddAndBuyNowModal,
    addAndBuyNowProduct,
    setAddAndBuyNowProduct,
  } = useAddAndBuyNowModal();

  return (
    <div className="user-container">
      <MenuDesktop setOpenModal={setOpenLoveModal} />
      <MenuMobile setOpenModal={setOpenLoveModal} />

      <main className="content-user">
        <ScrollToTop />
        {/* <Breadcrumbs /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Cart" element={<Cart />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/product" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-detail/:id" element={<OrderDetail />} />
          <Route path="/buynow" element={<BuyNow />} />
          <Route path="/product-detail/:id" element={<ProductDetail />} />
          <Route path="/dashboard" element={<UserDashboard />}>
            <Route path="info" element={<UserInfo />} />
            <Route path="orders" element={<UserOrders />} />
            <Route path="rating" element={<UserProductRating />} />
          </Route>

          <Route path="/momo-return" element={<MomoReturn />} />
        </Routes>
      </main>
      <Footer></Footer>

      <FloatingToolbar></FloatingToolbar>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover={false}
        draggable
        theme="light"
        className="custom-toast-container"
      />

      <FavoriteModal
        isOpen={openLoveModal}
        onClose={() => setOpenLoveModal(false)}>
        {favoriteItems.length > 0 ? null : (
          <div className="user-product-favorite-container">
            BẠN CHƯA CÓ SẢN PHẨM YÊU THÍCH NÀO CẢ ❤️‍🩹!!!
          </div>
        )}

        <Swiper
          spaceBetween={20}
          slidesPerView="auto"
          watchSlidesProgress={true}
          mousewheel={true}
          modules={[Mousewheel]}
          className="user-home-discount-swiper">
          {favoriteItems.map((product) => {
            return (
              <SwiperSlide
                key={product.id}
                style={{ width: "15.35rem" }}
                className="user-home-discount-slide">
                <ProductCard
                  key={product.id}
                  product={product}
                  isLoved={true}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </FavoriteModal>

      <AddAndBuyNowModel
        isOpen={openAddAndBuyNowModal.open}
        onClose={() => setOpenAddAndBuyNowModal({ open: false })}
        addAndBuyNowProduct={addAndBuyNowProduct.product_variant}
        product={addAndBuyNowProduct.product}
        fetchCart={fetchCart}
        navigate={navigate}
        isBuyNow={openAddAndBuyNowModal.isBuyNow}
        setOpenLoveModal={setOpenLoveModal}></AddAndBuyNowModel>
    </div>
  );
}
