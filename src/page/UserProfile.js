import React, { useEffect, useState } from "react";
import "../css/UserProfile.css";
import { FaEdit } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import UserInfoEditModal from "../component/UserInfoEditModal";
import api from "../service/api";
import Swal from "sweetalert2";
import { useUser } from "../component/UserContext";
import { format } from "date-fns";
import UserImageEditModal from "../component/UserImageEditModal";
import { getImageUrl } from "../component/commonFunc";


const maskEmail = (email) => {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const maskedName =
    name.slice(0, 3) + "*".repeat(Math.max(0, name.length - 3));
  return `${maskedName}@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return "";
  return phone.slice(0, 2) + "*".repeat(phone.length - 4) + phone.slice(-2);
};

const formatDate = (dob) => {
  if (!dob) return "";
  const date = new Date(dob);
  if (isNaN(date)) return dob;
  return format(date, "dd/MM/yyyy");
};

const UserProfile = () => {
  const [showModal, setShowModal] = useState(false);
  const { user, fetchUser } = useUser();
  const [userInfo, setUserInfo] = useState({});
  const [initialModalData, setInitialModalData] = useState(null);

  useEffect(() => {
    api
      .get("/user/info")
      .then((res) => {
        setUserInfo(res.data.result);
      })
      .catch((err) => {
        console.error(
          err.response?.data?.message || "Lỗi lấy thông tin người dùng"
        );
      });
  }, [user]);

  // Cập nhật initialModalData mỗi khi userInfo thay đổi
  useEffect(() => {
    if (userInfo?.full_name) {
      setInitialModalData({
        fullName: userInfo.full_name,
        dob: userInfo.date_of_birth
          ? new Date(userInfo.date_of_birth)
          : undefined,
        phone: userInfo.phone,
      });
    }
  }, [userInfo]);

  const openModal = () => {
    if (initialModalData) {
      setShowModal(true);
    }
  };

  const handleSaveInfo = (data) => {
    api
      .put("/user", {
        full_name: data.fullName,
        date_of_birth: data.dob, // gửi Date gốc
        phone: data.phone,
      })
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Cập nhật thành công!",
          text: "Thông tin người dùng đã được cập nhật.",
          confirmButtonText: "OK",
          timer: 2500,
          timerProgressBar: true,
        });
        fetchUser();
      })
      .catch((err) => {
        console.error(
          err.response?.data?.message || "Lỗi cập nhật thông tin người dùng"
        );
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể cập nhật thông tin người dùng!",
        });
      });
  };

  const [isModalOpen, setModalOpen] = useState(false);
  // croppedBlob là Blob hoặc File từ canvas (sau khi crop ảnh)
  const uploadAvatar = (croppedBlob) => {
    const formData = new FormData();
    formData.append("image", croppedBlob, "avatar.png"); // backend sẽ nhận theo key "file"

    api
      .put("/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log("Ảnh đã được cập nhật:", res.data);
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Ảnh đại diện đã được cập nhật!",
          timer: 2000,
        });
        fetchUser();
      })
      .catch((err) => {
        console.error(err.response?.data?.message || "Lỗi khi cập nhật ảnh");
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể cập nhật ảnh đại diện!",
        });
      });
  };



  return (
    <div className="user-profile-container">
      <div>
        <h2 className="user-profile-title">Thông tin khách hàng</h2>
        <div className="user-profile-detail">
          <div className="user-profile-field">
            <p className="user-profile-label">
              <span>Họ và tên</span> <span>:</span>
            </p>
            <p className="user-profile-value">{userInfo?.full_name}</p>
          </div>
          <div className="user-profile-field">
            <p className="user-profile-label">
              <span>Ngày sinh</span> <span>:</span>
            </p>
            <p className="user-profile-value">
              {formatDate(userInfo?.date_of_birth)}
            </p>
          </div>
          <div className="user-profile-field">
            <p className="user-profile-label">
              <span>Email</span> <span>:</span>
            </p>
            <p className="user-profile-value">{maskEmail(userInfo?.email)}</p>
          </div>
          <div className="user-profile-field">
            <p className="user-profile-label">
              <span>Số điện thoại</span> <span>:</span>
            </p>
            <p className="user-profile-value">{maskPhone(userInfo?.phone)}</p>
          </div>
          <button onClick={openModal}>
            Chỉnh sửa <MdEdit />
          </button>
        </div>
      </div>

      <div className="user-profile-right">
        <img
          src={userInfo?.avatar && getImageUrl(userInfo?.avatar)}
          alt="Avatar"
          className="user-profile-avatar"
        />
        <button onClick={() => setModalOpen(true)}>
          Thay đổi ảnh đại diện <FaEdit />
        </button>
      </div>

      {/* Modal chỉ render khi đã có initialModalData */}
      {initialModalData && (
        <UserInfoEditModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveInfo}
          initialData={initialModalData}
          Chevron={{ disabled: true }}
        />
      )}

      <UserImageEditModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={uploadAvatar}
        initialImage={getImageUrl(userInfo?.avatar)}
      />
    </div>
  );
};

export default UserProfile;
