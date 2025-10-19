import "../authenticate/Login2.css";
import img1 from "../img/image-removebg-preview (1).png";
import React, { useRef, useState } from "react";
import api from "../service/api";
import { Link, useNavigate } from "react-router-dom";
import { LoginSocialGoogle, LoginSocialFacebook } from "reactjs-social-login";
import {
  FacebookLoginButton,
  GoogleLoginButton,
} from "react-social-login-buttons";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { InputDateGroup } from "../component/InputComponent";

function Login2() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const calendarRef = useRef();
  const [errors, setErrors] = useState({});

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

  const handleLogin = (event) => {
    event.preventDefault();
    localStorage.removeItem("token");

    api
      .post("/auth/login", { email, password })
      .then((response) => {
        localStorage.setItem("token", response.data.result.token);
        Swal.fire({
          title: "Thành công",
          text: "Đăng nhập thành công!",
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });
        navigate("/");
      })
      .catch((error) => {
        Swal.fire({
          title: "Lỗi",
          text: error.response?.data?.message || "Đăng nhập thất bại",
          icon: "error",
          timer: 2500,
          showConfirmButton: false,
        });
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
      console.log(payload);
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
    if (name === "dob") {
      setBirthdate(value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div>
          <h2 className="brand-title">
            <Link to="/">H2 - Cosmetic</Link>
          </h2>
          <p className="welcome">Mừng bạn trở lại!</p>
          <h1 className="login-heading">Đăng nhập</h1>

          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              placeholder="login@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="password-row">
              <label>Mật khẩu</label>
              <Link
                href="#"
                className="forgot-link"
                to={"/auth/reset-password"}>
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              placeholder="********"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div>
              <button className="login-btn" type="submit">
                ĐĂNG NHẬP
              </button>
            </div>
          </form>

          <p className="or-text">Hoặc tiếp tục với</p>

          <div className="social-buttons">
            <LoginSocialGoogle
              client_id="867431480190-njl7ekq78at7cjosjmfrpkktp78njnqg.apps.googleusercontent.com"
              onResolve={({ data }) => handleSocialLogin(data, "google")}
              scope="email profile openid"
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
              <GoogleLoginButton
                style={{
                  width: "100%",
                  borderRadius: "0.5rem",
                  fontSize: "smaller",
                  padding: "8px 12px",
                }}
                iconSize="20px">
                Đăng nhập với Google
              </GoogleLoginButton>
            </LoginSocialGoogle>

            <LoginSocialFacebook
              appId="23932394653047054"
              scope="email,public_profile"
              fields="name,email,picture"
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
                style={{
                  width: "100%",
                  borderRadius: "0.5rem",
                  fontSize: "smaller",
                  padding: "8px 12px",
                }}
                iconSize="20px">
                Đăng nhập với Facebook
              </FacebookLoginButton>
            </LoginSocialFacebook>
          </div>

          <p className="signup-text">
            Bạn vẫn chưa có tài khoản?
            <br />
            <Link to="/auth/signup">Đăng ký ngay</Link>
          </p>
        </div>

        <div className="login-image">
          <img src={img1} alt="Illustration" />
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
          name="dob"
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

export default Login2;
