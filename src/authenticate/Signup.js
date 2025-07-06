import React, { useState, useRef } from "react";
import "../authenticate/Signup.css";
import img1 from "../img/image-removebg-preview (3).png";
import api from "../service/api";
import { Link, useNavigate } from "react-router-dom";
import { LoginSocialGoogle, LoginSocialFacebook } from "reactjs-social-login";
import {
  GoogleLoginButton,
  FacebookLoginButton,
} from "react-social-login-buttons";
import Swal from "sweetalert2";
import Modal from "react-modal";
import InputDateGroupSignup from "./InputDateGroupSignup";
import { InputDateGroup } from "../component/InputComponent";

function Signup() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [date_of_birth, setDateOfBirth] = useState("");
  const [errors, setErrors] = useState({});
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [birthdate, setBirthdate] = useState("");
  const calendarRef = useRef();
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateStrongPassword = (pw) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(pw);

  // Hàm kiểm tra định dạng và hợp lệ ngày sinh
  const validateDateFormat = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") {
      return "Vui lòng nhập ngày sinh.";
    }

    const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/(\d{4})$/;
    if (!dateRegex.test(dateStr)) {
      return "Vui lòng nhập ngày sinh theo: dd/mm/yyyy (ví dụ: 25/12/2000).";
    }

    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    const todayStr = today.toLocaleDateString("vi-VN");
    if (
      isNaN(date.getTime()) ||
      date.getDate() !== day ||
      date.getMonth() !== month - 1 ||
      date.getFullYear() !== year ||
      date > new Date()
    ) {
      return `Ngày sinh phải nhỏ hơn hoặc bằng (${todayStr}).`;
    }

    return "";
  };

  const handleSignup = (event) => {
    event.preventDefault();
    const newErrors = {};

    if (!full_name.trim()) newErrors.full_name = "Vui lòng nhập tên.";
    if (!email.trim()) newErrors.email = "Vui lòng nhập email.";
    else if (!validateEmail(email)) newErrors.email = "Email không hợp lệ.";
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu.";
    else if (!validateStrongPassword(password))
      newErrors.password =
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ thường, chữ in hoa và số.";
    if (!date_of_birth) newErrors.date_of_birth_form = "Vui lòng nhập ngày sinh.";
    else if (validateDateFormat(date_of_birth) !== "") newErrors.date_of_birth_form = validateDateFormat(date_of_birth);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    api
      .post("/user", {
        email,
        password,
        full_name,
        date_of_birth,
      })
      .then(() => {
        Swal.fire({
          title: "Thành công",
          text: "Đăng ký thành công!",
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });
        navigate("/auth/login");
      })
      .catch((error) => {
        const newErrors = {};
        if (error.response?.data?.code === 1002)
          newErrors.email = error.response?.data?.message;
        setErrors(newErrors);
        return;
      });
  };

  const handleSocialLogin = async (data, provider) => {
    const payload = {
      email: data.email,
      full_name: data.name,
      avatar: provider === "google" ? data.picture : data.picture.data.url,
    };

    const endpoint =
      provider === "google" ? "/auth/google-login" : "/auth/facebook-login";

    try {
      const res = await api.post(endpoint, payload);
      localStorage.setItem("token", res.data.result.token);
      Swal.fire({
        title: "Thành công",
        text: "Đăng nhập thành công!",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (err) {
      const errorCode = err.response?.data?.code;
      if (errorCode === 1001) {
        setUserInfo({ ...payload, provider });
        setShowBirthdayModal(true);
      } else {
        Swal.fire({
          title: "Lỗi",
          text: err.response?.data?.message || "Đăng nhập thất bại",
          icon: "error",
          timer: 2500,
          showConfirmButton: false,
        });
      }
    }
  };

  const handleSubmitBirthday = async () => {
    // Kiểm tra tính hợp lệ của ngày sinh
    const error = validateDateFormat(birthdate);
    if (error) {
      return;
    }

    try {
      // Tạo tài khoản mới
      const endpoint =
        userInfo.provider === "google"
          ? "/auth/google-login"
          : "/auth/facebook-login";
      const res = await api.post(endpoint, {
        email: userInfo.email,
        full_name: userInfo.full_name,
        avatar: userInfo.avatar,
        day_of_birth: birthdate,
      });
      localStorage.setItem("token", res.data.result.token);
      Swal.fire({
        title: "Thành công",
        text: "Đăng nhập thành công!",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
      });
      setShowBirthdayModal(false);
      navigate("/");
    } catch (err) {
      console.error("Lỗi API:", err.response?.data);
      Swal.fire({
        title: "Lỗi",
        text:
          err.response?.data?.message ||
          "Không thể tạo tài khoản hoặc đăng nhập lại",
        icon: "error",
        timer: 2500,
        showConfirmButton: false,
      });
    }
  };

  const handleInputChange = (name, { value, error }) => {
    if (name === "date_of_birth") {
      setBirthdate(value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
    if (name === "date_of_birth_form") {
      setDateOfBirth(value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left-side">
        <h2 className="signup-brand-title">
          <Link to="/">H2 - Cosmetic</Link>
        </h2>
        <div className="signup-image-container">
          <img src={img1} alt="Background" />
        </div>
      </div>

      <div className="signup-right-side">
        <div className="signup-form-container">
          <h3 className="signup-form-title">TẠO TÀI KHOẢN</h3>

          <div className="signup-social-buttons">
            <LoginSocialGoogle
              client_id="867431480190-njl7ekq78at7cjosjmfrpkktp78njnqg.apps.googleusercontent.com"
              onResolve={({ data }) => handleSocialLogin(data, "google")}
              onReject={(err) => {
                console.error("Đăng nhập Google thất bại:", err);
                Swal.fire({
                  title: "Lỗi",
                  text: "Đăng nhập Google thất bại",
                  icon: "error",
                  timer: 2500,
                  showConfirmButton: false,
                });
              }}>
              <GoogleLoginButton className="signup-google-btn" iconSize="20px">
                Đăng nhập với Google
              </GoogleLoginButton>
            </LoginSocialGoogle>

            <LoginSocialFacebook
              appId="23932394653047054"
              onResolve={({ data }) => handleSocialLogin(data, "facebook")}
              onReject={(err) => {
                console.error("Đăng nhập Facebook thất bại:", err);
                Swal.fire({
                  title: "Lỗi",
                  text: "Đăng nhập Facebook thất bại",
                  icon: "error",
                  timer: 2500,
                  showConfirmButton: false,
                });
              }}>
              <FacebookLoginButton
                className="signup-facebook-btn"
                iconSize="20px">
                Đăng nhập với Facebook
              </FacebookLoginButton>
            </LoginSocialFacebook>
          </div>

          <p className="signup-or-text">- HOẶC -</p>

          <form onSubmit={handleSignup} noValidate>
            <div className="signup-input-group">
              <label htmlFor="full-name">Tên người dùng</label>
              <input
                type="text"
                id="full-name"
                placeholder="Nhập họ và tên"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.full_name && (
                <p className="signup-error">{errors.full_name}</p>
              )}
            </div>

            <div className="signup-input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="signup-error">{errors.email}</p>}
            </div>

            <div className="signup-input-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="signup-error">{errors.password}</p>
              )}
            </div>

            <InputDateGroupSignup
              name="date_of_birth_form"
              label="Ngày sinh"
              value={date_of_birth}
              onChange={handleInputChange}
              errors={errors}
              placeholder="dd/mm/yyyy"
            />

            <button type="submit" className="signup-create-account-btn">
              ĐĂNG KÝ
            </button>
          </form>

          <p className="signup-login-text">
            Đã có tài khoản? <Link to="/auth/login">Đăng nhập</Link>
          </p>
        </div>
      </div>

      <Modal
        isOpen={showBirthdayModal}
        onRequestClose={() => setShowBirthdayModal(false)}
        contentLabel="Nhập ngày sinh"
        className="user-login-modal-content"
        overlayClassName="user-login-modal-overlay"
        ariaHideApp={false}>
        <h2>Chào mừng bạn đến với H2 - Cosmetic!</h2>
        <p>Vui lòng nhập ngày sinh để hoàn tất đăng ký</p>
        <InputDateGroup
          name="date_of_birth"
          label="Ngày sinh"
          placeholder="Nhập ngày sinh: dd/mm/yyyy"
          value={birthdate}
          onChange={handleInputChange}
          errors={errors}
          ref={calendarRef}
        />
        <button onClick={handleSubmitBirthday} style={{ padding: "8px 12px" }}>
          Xác nhận
        </button>
      </Modal>
    </div>
  );
}

export default Signup;
