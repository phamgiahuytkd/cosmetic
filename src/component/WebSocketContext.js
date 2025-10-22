import React, { createContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNotifications } from "./NotificationContext";

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children, userId, onOrderUpdate }) => {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const { notifications, fetchNotifications } = useNotifications();

  useEffect(() => {
    const socketUrl =
      "https://icommerce-production.up.railway.app/iCommerce/ws";
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 3000,
      debug: (msg) => console.log("STOMP:", msg),
      onConnect: () => {
        console.log("✅ WebSocket connected (User)");
        setConnected(true);

        const topic = `/topic/user/${userId}`;
        client.subscribe(topic, (msg) => {
          let data = msg.body;
          try {
            data = JSON.parse(msg.body);
          } catch {
            // payload không phải JSON thì giữ nguyên string
          }

          console.log("📩 Received:", data);

          if (typeof data === "string") {
            switch (data) {
              case "REFUSED":
                toast.error("❌ Đơn hàng của bạn đã bị từ chối!", {
                  position: "top-right",
                  autoClose: 4000,
                });
                break;
              case "APPROVED":
                toast.success("✅ Đơn hàng của bạn đã được chấp nhận!", {
                  position: "top-right",
                  autoClose: 4000,
                });
                break;
              case "DELIVERING":
                toast.info("🚚 Đơn hàng đang được vận chuyển!", {
                  position: "top-right",
                  autoClose: 4000,
                });
                break;
              case "DELIVERED":
                toast.success("📦 Đơn hàng đã được giao thành công!", {
                  position: "top-right",
                  autoClose: 4000,
                });
                break;
              default:
                break;
            }

            // Gọi callback fetch lại đơn hàng
            fetchNotifications();
            onOrderUpdate && onOrderUpdate();
          }
        });
      },
      onWebSocketError: (err) => console.error("❌ WS Error:", err),
      onDisconnect: () => {
        console.warn("🔌 Disconnected");
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      console.log("🔌 Cleanup WebSocket");
    };
  }, [userId, onOrderUpdate]);

  return (
    <WebSocketContext.Provider value={{ connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
