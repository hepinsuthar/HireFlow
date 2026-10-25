import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const { info } = useToast();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
    const s = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    s.on("connect", () => {
      // connected to real-time events
    });

    s.on("notification:new", (data) => {
      setUnreadCount((c) => c + 1);
      info(data.title || "New notification received");
    });

    s.on("application:status_changed", (data) => {
      info(`Application status updated to: ${data.status}`);
      setUnreadCount((c) => c + 1);
    });

    s.on("interview:scheduled", (data) => {
      info(`New interview scheduled for ${new Date(data.scheduledAt).toLocaleDateString()}`);
      setUnreadCount((c) => c + 1);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
}
