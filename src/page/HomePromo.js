import '../css/HomePromo.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, FreeMode, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { RxInfoCircled } from 'react-icons/rx';
import { BiSolidDiscount } from "react-icons/bi";
import { MdDiscount } from "react-icons/md";

const promotions = [
  {
    icon: 1,
    title: 'GIẢM 15K',
    condition: 'Đơn hàng bất kỳ từ 399k',
    code: 'MOI15',
    expiry: '31/12/2024'
  },
  {
    icon: 0,
    title: 'GIẢM 80K',
    condition: 'Khi mua Bộ Trang Điểm Mùa Lễ Hội',
    code: 'COMBOLEHOI',
    expiry: '31/12/2024'
  },
  {
    icon: 0,
    title: 'GIẢM 50K',
    condition: 'Áp dụng giảm 50k khi mua combo\nPhấn nước Premium và Phấn phủ',
    code: 'COMBO',
    expiry: '31/12/2024'
  },
  {
    icon: 1,
    title: 'GIẢM 50K',
    condition: 'Áp dụng giảm 50k khi mua combo\nPhấn nước Premium và Phấn phủ',
    code: 'COMBO00000000000000000',
    expiry: '31/12/2024'
  },
  {
    icon: 1,
    title: 'GIẢM 50K',
    condition: 'Áp dụng giảm 50k khi mua combo\nPhấn nước Premium và Phấn phủ',
    code: 'COMBO',
    expiry: '31/12/2024'
  },
  {
    icon: 1,
    title: 'GIẢM 50K',
    condition: 'Áp dụng giảm 50k khi mua combo\nPhấn nước Premium và Phấn phủ',
    code: 'COMBO',
    expiry: '31/12/2024'
  },
  {
    icon: 0,
    title: 'GIẢM 50K',
    condition: 'Áp dụng giảm 50k khi mua combo\nPhấn nước Baby Skin và Phấn phủ',
    code: 'COMBOBABY',
    expiry: '31/12/2024'
  }

];

const HomePromo = () => {
  
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
          {promotions.map((item, index) => (
            <SwiperSlide key={index} style={{ width: "20rem" }}>
              <div className="user-home-promo-item">
                <div className="user-home-promo-icon">
                  {item.icon === 1 ? <BiSolidDiscount /> : <MdDiscount />}
                </div>
                <div className="user-home-promo-content">
                  <div>
                    <div className="user-home-promo-condition">
                      <h4>{item.title}</h4>
                      <p>{item.condition}</p>
                    </div>
                    <span>
                      <RxInfoCircled />
                    </span>
                  </div>

                  <div>
                    <div className="user-home-promo-info">
                      <p className="user-home-promo-code">
                        Mã: <strong>{item.code}</strong>
                      </p>
                      <p className="user-home-promo-expiry">
                        HSD: {item.expiry}
                      </p>
                    </div>
                    <button className="user-home-promo-button">SAO CHÉP</button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default HomePromo;
