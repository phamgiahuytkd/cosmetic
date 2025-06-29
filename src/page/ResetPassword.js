import React, { useState, useEffect, useRef } from "react";
import "../css/ResetPassword.css";
import api from "../service/api";
import { InputGroup, InputGroupPassword } from "../component/InputComponent";
import { FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const [tokenValidityTimer, setTokenValidityTimer] = useState(0);
  const [resendCooldownTimer, setResendCooldownTimer] = useState(0);

  const tokenTimerRef = useRef(null);
  const resendTimerRef = useRef(null);

  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const navigate = useNavigate();

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

  const startCountdowns = () => {
    setTokenValidityTimer(300);
    setResendCooldownTimer(30);

    clearInterval(tokenTimerRef.current);
    tokenTimerRef.current = setInterval(() => {
      setTokenValidityTimer((prev) => {
        if (prev <= 1) {
          clearInterval(tokenTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendCooldownTimer((prev) => {
        if (prev <= 1) {
          clearInterval(resendTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendResetCode = async () => {
    const newErrors = {};
    if (!form.email) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoadingSend(true);
      await api.post("/auth/forgot-password", null, {
        params: { email: form.email },
      });
      Swal.fire(
        "Thành công",
        "Mã xác nhận đã được gửi đến email của bạn.",
        "success"
      );
      setStep(2);
      startCountdowns();
    } catch (err) {
      setErrors({
        email:
          err?.response?.data?.message ||
          "Không thể gửi mã xác nhận. Vui lòng thử lại.",
      });
    } finally {
      setLoadingSend(false);
    }
  };

  const verifyResetToken = async () => {
    if (!form.token) {
      setErrors({ token: "Vui lòng nhập mã xác nhận." });
      return;
    }

    try {
      setLoadingVerify(true);
      await api.post("/auth/verify-reset-token", null, {
        params: { email: form.email, token: form.token },
      });
      Swal.fire("Thành công", "Mã xác nhận hợp lệ.", "success");
      setStep(3);
      clearInterval(tokenTimerRef.current);
      clearInterval(resendTimerRef.current);
    } catch (err) {
      setErrors({
        token:
          err?.response?.data?.message ||
          "Mã xác nhận không đúng hoặc đã hết hạn.",
      });
    } finally {
      setLoadingVerify(false);
    }
  };

  const resetPassword = async () => {
    const newErrors = {};

    if (!form.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
    } else if (!validateStrongPassword(form.newPassword)) {
      newErrors.newPassword =
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ thường, chữ in hoa và số.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoadingReset(true);
      await api.post("/auth/reset-password", null, {
        params: {
          email: form.email,
          token: form.token,
          newPassword: form.newPassword,
        },
      });
      Swal.fire(
        "Thành công",
        "Mật khẩu đã được đặt lại thành công.",
        "success"
      );
      setStep(1);
      setForm({
        email: "",
        token: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      navigate("/auth/login");
    } catch (err) {
      setErrors({
        confirmPassword:
          err?.response?.data?.message || "Đặt lại mật khẩu thất bại.",
      });
    } finally {
      setLoadingReset(false);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(tokenTimerRef.current);
      clearInterval(resendTimerRef.current);
    };
  }, []);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const renderSpinner = () => (
    <FaSpinner className="spin-icon" style={{ marginLeft: 8 }} />
  );

  return (
    <div className="user-reset-password-content">
      <div className="user-reset-password-container">
        <h2 className="user-reset-password-title">Lấy lại mật khẩu</h2>

        {step === 1 && (
          <div className="user-reset-password-step">
            <div className="user-reset-password-input">
              <InputGroup
                name="email"
                label="Email"
                placeholder="Nhập email"
                value={form.email}
                onChange={handleChange}
                errors={errors}
              />
              <div className="user-reset-password-send-mail-img">
                <img alt="image/sendmail.png" src="/image/sendmail.png" />
              </div>
            </div>
            <button
              onClick={sendResetCode}
              className="user-reset-password-button"
              disabled={loadingSend}>
              {loadingSend ? "Đang gửi..." : "Gửi mã xác nhận"}
              {loadingSend && renderSpinner()}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="user-reset-password-step">
            <div className="user-reset-password-input">
              <InputGroup
                name="token"
                label="Mã xác nhận"
                placeholder="Nhập mã xác nhận"
                value={form.token}
                onChange={handleChange}
                errors={errors}
              />

              <div className="user-reset-password-resend">
                <button
                  onClick={sendResetCode}
                  disabled={resendCooldownTimer > 0}
                  className={`user-reset-password-button user-reset-password-resend-btn ${
                    resendCooldownTimer > 0 ? "disabled" : ""
                  }`}>
                  {resendCooldownTimer > 0
                    ? `Vui lòng chờ (${resendCooldownTimer}s)`
                    : "Gửi lại mã"}
                  {loadingSend && renderSpinner()}
                </button>
                <p>
                  Thời gian hiệu lực mã:{" "}
                  <strong>{formatTime(tokenValidityTimer)}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={verifyResetToken}
              className="user-reset-password-button"
              disabled={loadingVerify}>
              {loadingVerify ? "Đang xác minh..." : "Xác minh mã"}
              {loadingVerify && renderSpinner()}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="user-reset-password-step">
            <div className="user-reset-password-input">
              <InputGroupPassword
                name="newPassword"
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
                value={form.newPassword}
                onChange={handleChange}
                errors={errors}
              />
              <InputGroupPassword
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={handleChange}
                errors={errors}
              />
            </div>
            <button
              onClick={resetPassword}
              className="user-reset-password-button"
              disabled={loadingReset}>
              {loadingReset ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              {loadingReset && renderSpinner()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
