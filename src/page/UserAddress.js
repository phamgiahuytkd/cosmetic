import React, { useEffect, useState } from "react";
import "../css/UserAddress.css";
import Swal from "sweetalert2";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdAddLocationAlt } from "react-icons/md";
import { RiDeleteBack2Fill } from "react-icons/ri";
import UserAddAddressModal from "../component/UserAddAddressModal";
import api from "../service/api";
import { useUser } from "../component/UserContext";

const UserAddress = () => {
  const { user, fetchUser } = useUser();
  const showMap = (locate) => {
    const [lat, lng] = locate.split(",").map(parseFloat);
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    Swal.fire({
      title: "Bản đồ vị trí",
      html: `<iframe 
                src="${mapUrl}" 
                width="100%" 
                height="350" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy">
             </iframe>`,
      width: 600,
      confirmButtonText: "Đóng",
      customClass: {
        popup: "user-address-swal-popup",
        confirmButton: "user-address-swal-confirm-btn",
      },
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);

  // Hàm lấy danh sách địa chỉ
  const fetchAddresses = () => {
    api
      .get("/address")
      .then((res) => {
        setAddresses(res.data.result);
      })
      .catch((err) => {
        console.error(
          err.response?.data?.message || "Lỗi lấy địa chỉ người dùng."
        );
      });
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmitAddress = (newAddress) => {
    api
      .post("/address", {
        name: newAddress.name,
        phone: newAddress.phone,
        address: newAddress.address,
        address_detail: newAddress.address_detail,
        locate: newAddress.locate,
      })
      .then(() => {
        // Gọi lại API để lấy danh sách địa chỉ mới
        fetchAddresses();
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Bạn đã thêm địa chỉ thành công.",
          confirmButtonText: "OK",
          timer: 2500,
          timerProgressBar: true,
        });
      })
      .catch((err) => {
        console.error(err.response?.data?.message || "Lỗi thêm địa chỉ");
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể thêm địa chỉ!",
        });
      });
  };

  const handleDeleteAddress = (id) => {
    Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa địa chỉ này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      customClass: {
        popup: "user-address-swal-popup",
        confirmButton: "user-address-swal-confirm-btn",
        cancelButton: "user-address-swal-cancel-btn",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        api
          .delete(`/address/${id}`)
          .then(() => {
            setAddresses((prev) => prev.filter((addr) => addr.id !== id));
            Swal.fire({
              icon: "success",
              title: "Đã xóa!",
              text: "Địa chỉ đã được xóa thành công.",
              confirmButtonText: "OK",
              timer: 2500,
              timerProgressBar: true,
            });
          })
          .catch((err) => {
            console.error(err.response?.data?.message || "Lỗi xóa địa chỉ");
            Swal.fire({
              icon: "error",
              title: "Lỗi",
              text: "Không thể xóa địa chỉ!",
            });
          });
      }
    });
  };

  const handleSetDefaultAddress = (id) => {
    api
      .put(
        `/user`,
        {
          default_shipping_address: id,
        },
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      .then(() => {
        fetchUser();
        // Swal.fire({
        //   icon: "success",
        //   title: "Thành công!",
        //   text: "Đã đặt thành địa chỉ mặc định.",
        //   confirmButtonText: "OK",
        //   timer: 2500,
        //   timerProgressBar: true,
        // });
      })
      .catch((err) => {
        console.error(err.response?.data?.message || "Lỗi xóa địa chỉ");
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể đặt địa chỉ mặc định!",
        });
      });
  };

  return (
    <div className="user-address-container">
      <h2 className="user-address-title">
        Địa chỉ của bạn{" "}
        <button onClick={() => setIsModalOpen(true)}>
          Thêm địa chỉ <MdAddLocationAlt />
        </button>
      </h2>
      <div className="user-address-list">
        {addresses.map((addr) => (
          <div className="user-address-card" key={addr.id}>
            {addr.id !== user?.default_address && (
              <button
                className="user-address-remove-btn"
                onClick={() => handleDeleteAddress(addr.id)}
                title="Xóa địa chỉ">
                <RiDeleteBack2Fill />
              </button>
            )}

            <div className="user-address-field">
              <p className="user-address-label">
                <span>Họ và tên </span> <span>:</span>
              </p>
              <p className="user-address-value">{addr.name}</p>
            </div>
            <div className="user-address-field">
              <p className="user-address-label">
                <span>SĐT </span> <span>:</span>
              </p>
              <p className="user-address-value">{addr.phone}</p>
            </div>
            <div className="user-address-field">
              <p className="user-address-label">
                <span>Địa chỉ </span> <span>:</span>
              </p>
              <p className="user-address-value">{addr.address}</p>
            </div>
            <div className="user-address-field">
              <p className="user-address-label">
                <span>Chi tiết </span> <span>:</span>
              </p>
              <p className="user-address-value">{addr.address_detail}</p>
            </div>
            <div className="user-address-field">
              <p className="user-address-label">
                <span>Tọa độ </span> <span>:</span>
              </p>
              <p className="user-address-value">
                {addr.locate}
                <FaMapMarkerAlt
                  className="user-address-icon"
                  onClick={() => showMap(addr.locate)}
                  title="Xem bản đồ"
                />
              </p>
            </div>
            <div className="user-address-defalt">
              <div className="user-address-defalt">
                {addr.id === user?.default_address ? (
                  <button
                    disabled
                    style={{
                      backgroundColor: "#4CAF50", // màu xanh
                      color: "white",
                      cursor: "default",
                    }}>
                    Mặc định
                  </button>
                ) : (
                  <button onClick={() => handleSetDefaultAddress(addr.id)}>
                    Đặt làm mặc định
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {addresses.length < 1 && (
          <div className="user-address-empty">
            <p>Chưa có địa chỉ nào. Nhấn "Thêm địa chỉ" để bắt đầu.</p>
          </div>
        )}
      </div>

      <UserAddAddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSubmitAddress}
      />
    </div>
  );
};

export default UserAddress;
