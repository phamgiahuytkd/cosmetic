// src/pages/MomoReturn.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../service/api";

const MomoReturn = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Đang xử lý...");
  const navigate = useNavigate();

  useEffect(() => {
    const momoData = {};
    for (const [key, value] of searchParams.entries()) {
      momoData[key] = value;
    }

    const resultCode = momoData.resultCode;

    if (resultCode === "0") {
      setStatus("Thanh toán thành công! Đang xác nhận giao dịch...");

      api
        .post("/api/momo/ipn-handler", momoData)
        .then((res) => {
          console.log("IPN confirm:", res.data);
          setStatus("Giao dịch đã được xác nhận thành công!");
          navigate(`/order-detail/${momoData.orderInfo}`);
        })
        .catch((err) => {
          console.error("IPN lỗi:", err);
          setStatus("Xác nhận giao dịch thất bại.");
          navigate(`/order-detail/${momoData.orderInfo}`);
        });
    } else {
      setStatus(`Thanh toán thất bại (resultCode = ${resultCode})`);
      navigate(`/order-detail/${momoData.orderInfo}`);
    }
  }, [searchParams]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Kết quả thanh toán MoMo</h2>
      <p>{status}</p>
    </div>
  );
};

export default MomoReturn;
