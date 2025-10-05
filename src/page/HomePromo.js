"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { RxInfoCircled } from "react-icons/rx";
import { BiSolidDiscount } from "react-icons/bi";
import { MdDiscount } from "react-icons/md";
import { useUser } from "../component/UserContext";
import { formatDateTimeVN, formatPrice } from "../component/commonFunc";
import PromoDetail from "../component/PromoDetail";
import "../css/HomePromo.css";

// ✅ import swal
import Swal from "sweetalert2";

const HomePromo = () => {
  const { voucher } = useUser();
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (voucher) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVoucher(null);
  };

  // ✅ hàm copy code kèm swal
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      Swal.fire({
        icon: "success",
        title: "Đã sao chép!",
        text: `Mã khuyến mãi: ${code}`,
        showConfirmButton: false,
        timer: 1500,
      });
    });
  };

  return (
    <div className="user-home-promo">
      <h2 className="user-home-promo-title">KHUYẾN MÃI DÀNH CHO BẠN</h2>
      <div className="user-home-promo-container">
        <Swiper
          modules={[FreeMode, Mousewheel]}
          spaceBetween={28}
          freeMode={true}
          mousewheel={true}
          slidesPerView="auto"
          className="user-home-promo-swiper">
          {voucher.map((item, index) => (
            <SwiperSlide key={index} style={{ width: "20rem" }}>
              <div className="user-home-promo-item">
                <div className="user-home-promo-icon">
                  {item.voucher_type === "PERCENTAGE" ? (
                    <BiSolidDiscount />
                  ) : (
                    <MdDiscount />
                  )}
                </div>
                <div className="user-home-promo-content">
                  <div>
                    <div className="user-home-promo-condition">
                      <h4>
                        KHUYẾN MÃI:{" "}
                        {item.voucher_type === "FIXED_AMOUNT"
                          ? formatPrice(item?.max_amount)
                          : `${item?.percent}%`}
                      </h4>
                      <p>{item.description}</p>
                    </div>
                    <span
                      className="user-home-promo-info-icon"
                      onClick={() => handleOpenModal(item)}>
                      <RxInfoCircled />
                    </span>
                  </div>

                  <div>
                    <div className="user-home-promo-info">
                      <p className="user-home-promo-code">
                        Mã: <strong>{item.code}</strong>
                      </p>
                      <p className="user-home-promo-expiry">
                        HSD: {formatDateTimeVN(item.end_day)}
                      </p>
                    </div>
                    {/* ✅ gán hàm copy */}
                    <button
                      className="user-home-promo-button"
                      onClick={() => handleCopyCode(item.code)}>
                      SAO CHÉP
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <PromoDetail
        voucher={selectedVoucher}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default HomePromo;
