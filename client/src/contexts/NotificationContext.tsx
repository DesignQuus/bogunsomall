"use client";
/*
 * NotificationContext.tsx
 * 주문 알림 및 상태 변경 알림 관리
 */

import { createContext, useContext, useState, useCallback } from "react";

export interface Notification {
  id: string;
  orderId: string;
  type: "order_status" | "order_completed" | "order_cancelled" | "order_delayed";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif-001",
      orderId: "ORD-2024-001",
      type: "order_completed",
      title: "주문 완료",
      message: "명함 주문(ORD-2024-001)이 완료되었습니다.",
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: "/order-history",
    },
    {
      id: "notif-002",
      orderId: "ORD-2024-002",
      type: "order_status",
      title: "주문 상태 변경",
      message: "전단지 주문(ORD-2024-002)이 인쇄 중입니다.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
      actionUrl: "/order-history",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
