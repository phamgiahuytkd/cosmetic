"use client";

import { useEffect, useState } from "react";
import "../css/UserProfile.css";
import { FaEdit } from "react-icons/fa";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import api from "../service/api";
import { getImageUrl } from "../component/commonFunc";
import UserImageEditModal from "../component/UserImageEditModal";

const maskEmail = (email) => {
  if (!email) return "N/A";
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) return email;
  return `${localPart.slice(0, 2)}****@${domain}`;
};

const UserProfile = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      full_name: "",
      phone: "",
      date_of_birth: "",
      avatar: "",
      email: "",
    },
  });

  const watchAvatar = watch("avatar");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [isImageEditModalOpen, setIsImageEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/user/info");

        if (response.data.result) {
          const { full_name, email, phone, date_of_birth, avatar, reputation } =
            response.data.result;

          setUserInfo({
            full_name,
            email,
            phone,
            date_of_birth,
            avatar,
            reputation,
          });

          setValue("full_name", full_name || "");
          setValue("phone", phone || "");
          setValue(
            "date_of_birth",
            date_of_birth ? date_of_birth.split("T")[0] : ""
          );
          setValue("avatar", avatar || "");
          setValue("email", email || "");
        } else {
          setErrorMessage(
            response?.data?.message || "Không thể tải thông tin người dùng"
          );
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setErrorMessage(error.response?.data?.message || "Lỗi kết nối API");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    register("avatar", {
      required: "Vui lòng chọn ảnh đại diện",
    });
  }, [register]);

  const handleImageSave = (croppedBase64) => {
    // lưu base64 trực tiếp theo kiểu admin
    setValue("avatar", croppedBase64, {
      shouldValidate: true,
      shouldDirty: true,
    });
    clearErrors("avatar");
    setIsImageEditModalOpen(false);
  };

  const getAvatarUrl = () => {
    const a = watchAvatar;
    if (!a) return "/image/default-avatar-profile.jpg";

    if (typeof a === "string") {
      if (a.startsWith("data:image")) return a;
      if (a.startsWith("http://") || a.startsWith("https://")) return a;
      try {
        return getImageUrl(a);
      } catch {
        return a;
      }
    }

    if (a instanceof File) {
      return URL.createObjectURL(a);
    }

    return "/image/default-avatar-profile.jpg";
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const formData = new FormData();
      formData.append("full_name", data.full_name || "");
      formData.append("phone", data.phone || "");
      formData.append("email", data.email || "");

      if (data.date_of_birth) {
        const date = new Date(data.date_of_birth);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
        formData.append("date_of_birth", formattedDate);
      }

      // Nếu avatar là base64 -> convert -> append
      if (
        data.avatar &&
        typeof data.avatar === "string" &&
        data.avatar.startsWith("data:image")
      ) {
        const blob = await fetch(data.avatar).then((res) => res.blob());
        const file = new File([blob], "avatar.jpg", {
          type: blob.type || "image/jpeg",
        });
        formData.append("avatar", file);
      } else if (data.avatar instanceof File) {
        formData.append("avatar", data.avatar);
      }

      // Debug: inspect form entries (cẩn thận với File)
      for (const pair of formData.entries()) {
        console.log("formData", pair[0], pair[1]);
      }

      // IMPORTANT: nếu api (axios wrapper) có header mặc định 'application/json' -> nó sẽ override
      // để an toàn, xóa các header Content-Type mặc định cho PUT/POST trước khi gọi.
      try {
        if (api && api.defaults && api.defaults.headers) {
          if (api.defaults.headers.common)
            delete api.defaults.headers.common["Content-Type"];
          if (api.defaults.headers.post)
            delete api.defaults.headers.post["Content-Type"];
          if (api.defaults.headers.put)
            delete api.defaults.headers.put["Content-Type"];
        }
      } catch (err) {
        // ignore if api wrapper không có cấu trúc này
      }

      // Gửi FormData mà KHÔNG set header Content-Type thủ công -> browser sẽ thêm boundary
      await api.put("/user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Cập nhật thông tin người dùng thành công!",
        confirmButtonColor: "#22c55e",
        timer: 2000,
        timerProgressBar: true,
      });

      // Reload profile (server có thể trả URL mới)
      const resp = await api.get("/user/info");
      if (resp.data.result) {
        const { full_name, email, phone, date_of_birth, avatar, reputation } =
          resp.data.result;
        setUserInfo({
          full_name,
          email,
          phone,
          date_of_birth,
          avatar,
          reputation,
        });
        setValue("avatar", avatar || "");
        setValue("full_name", full_name || "");
        setValue("phone", phone || "");
        setValue(
          "date_of_birth",
          date_of_birth ? date_of_birth.split("T")[0] : ""
        );
        setValue("email", email || "");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage(
        error.response?.data?.message || "Lỗi khi cập nhật thông tin"
      );
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.response?.data?.message || "Lỗi khi cập nhật thông tin",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-profile-container">
      {errorMessage && (
        <div className="user-profile-error-message">{errorMessage}</div>
      )}

      <div className="user-profile-content">
        <h2 className="user-profile-title">Thông tin khách hàng</h2>

        <div className="user-profile-form-container">
          <div className="user-profile-form-img">
            <div className="user-profile-avatar-container">
              <img
                src={getAvatarUrl()}
                alt="Avatar"
                className="user-profile-avatar"
              />
              <button
                onClick={() => setIsImageEditModalOpen(true)}
                className="user-profile-edit-avatar-button"
                disabled={loading}>
                <FaEdit />
              </button>
            </div>

            {/* --- Uy tín người dùng --- */}
            {userInfo && (
              <div className="user-profile-reputation-container">
                <div className="user-profile-reputation-header">
                  <span>Uy tín</span>
                  <span>{userInfo.reputation}/100</span>
                </div>

                <div className="user-profile-reputation-bar">
                  <div
                    className={`user-profile-reputation-progress ${
                      userInfo.reputation < 40
                        ? "low"
                        : userInfo.reputation < 80
                        ? "medium"
                        : "high"
                    }`}
                    style={{ width: `${userInfo.reputation}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="user-profile-form">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="user-profile-form-fields">
                <div className="user-profile-form-group">
                  <label className="user-profile-label">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("full_name", {
                      required: "Họ và tên là bắt buộc",
                    })}
                    className={`user-profile-input ${
                      errors.full_name ? "border-red-600" : ""
                    }`}
                    placeholder="Nhập họ và tên"
                    disabled={loading}
                  />
                  {errors.full_name && (
                    <span className="user-profile-error">
                      {errors.full_name.message}
                    </span>
                  )}
                </div>

                <div className="user-profile-form-group">
                  <label className="user-profile-label">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register("phone", {
                      required: "Số điện thoại là bắt buộc",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Số điện thoại phải có đúng 10 chữ số",
                      },
                    })}
                    className={`user-profile-input ${
                      errors.phone ? "border-red-600" : ""
                    }`}
                    placeholder="Nhập số điện thoại"
                    disabled={loading}
                  />
                  {errors.phone && (
                    <span className="user-profile-error">
                      {errors.phone.message}
                    </span>
                  )}
                </div>

                <div className="user-profile-form-group">
                  <label className="user-profile-label">Email</label>
                  <div className="user-profile-input bg-gray-100 text-gray-600">
                    {maskEmail(userInfo?.email)}
                  </div>
                </div>

                <div className="user-profile-form-group">
                  <label className="user-profile-label">Ngày sinh</label>
                  <input
                    type="date"
                    {...register("date_of_birth")}
                    className={`user-profile-input ${
                      errors.date_of_birth ? "border-red-600" : ""
                    }`}
                    disabled={loading}
                  />
                </div>

                <div className="user-profile-form-actions">
                  <button
                    type="submit"
                    className="user-profile-save-button"
                    disabled={loading}>
                    {loading ? (
                      <>
                        <div className="user-profile-spinner" /> Đang xử lý...
                      </>
                    ) : (
                      "LƯU THAY ĐỔI"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <UserImageEditModal
        isOpen={isImageEditModalOpen}
        onClose={() => setIsImageEditModalOpen(false)}
        onSave={handleImageSave}
        initialImage={
          watchAvatar || (userInfo?.avatar ? getImageUrl(userInfo.avatar) : "")
        }
      />
    </div>
  );
};

export default UserProfile;
