import React, { useState } from "react";
import Swal from "sweetalert2";
import api from "../service/api";
import "../css/UserSecurity.css";
import { InputGroupPassword } from "../component/InputComponent";
import { useUser } from "../component/UserContext";

const UserSecurity = () => {
  const { user, fetchUser } = useUser();

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!form.old_password) {
      newErrors.old_password = "Vui lòng nhập mật khẩu cũ";
    }

    if (!form.new_password) {
      newErrors.new_password = "Vui lòng nhập mật khẩu mới";
    } else if (!strongPasswordRegex.test(form.new_password)) {
      newErrors.new_password =
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ thường, chữ in hoa và số";
    }

    if (!form.confirm_password) {
      newErrors.confirm_password = "Vui lòng nhập lại mật khẩu mới";
    } else if (form.new_password !== form.confirm_password) {
      newErrors.confirm_password = "Mật khẩu mới không khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await api.post("/auth/change-password", {
        password: form.old_password,
        new_password: form.new_password,
      });

      Swal.fire({
        icon: "success",
        title: "Đổi mật khẩu thành công",
        showConfirmButton: false,
        timer: 1500,
      });

      setForm({ old_password: "", new_password: "", confirm_password: "" });
      setErrors({});
    } catch (error) {
      const errCode = error.response?.data?.code;
      if (errCode === 1004) {
        setErrors({ old_password: "Mật khẩu hiện tại không đúng" });
      }
    }
  };

  return (
    <div className="user-security-container">
      <h2 className="user-security-title">Đổi mật khẩu</h2>
      <div className="user-security-form-container">
        {user?.account_type === "SOCIAL" ? (
          <div className="user-security-not-available">
            <h3>Tính năng không khả dụng</h3>
            <p>Bạn đang đăng nhập bằng tài khoản mạng xã hội 🥰!!!</p>
          </div>
        ) : (
          <div className="user-security-form">
            <InputGroupPassword
              name="old_password"
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              value={form.old_password}
              onChange={handleChange}
              errors={errors}
            />
            <InputGroupPassword
              name="new_password"
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={form.new_password}
              onChange={handleChange}
              errors={errors}
            />
            <InputGroupPassword
              name="confirm_password"
              label="Nhập lại mật khẩu mới"
              placeholder="Xác nhận mật khẩu mới"
              value={form.confirm_password}
              onChange={handleChange}
              errors={errors}
            />

            <button className="user-security-button" onClick={handleSubmit}>
              Đổi mật khẩu
            </button>

            <div className="user-security-forgot">
              <a
                href="/auth/reset-password"
                className="user-security-forgot-link">
                Quên mật khẩu?
              </a>
            </div>
          </div>
        )}

        <div className="user-security-form-img">
          <img
            src={
              user?.account_type === "SOCIAL"
                ? "/image/facebook-google-icons.png"
                : "/image/online-secure-payment-icon.png"
            }
            alt="online-secure-payment-icon"
          />
        </div>
      </div>
    </div>
  );
};

export default UserSecurity;
