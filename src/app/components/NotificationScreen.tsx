import { Bell, MessageCircle, Target, Gift, AlertCircle, X, CheckCircle2, Zap } from "lucide-react";
import { useState } from "react";

type Notification = {
  id: number;
  type: "message" | "quest" | "reward" | "alert";
  title: string;
  description: string;
  time: string;
  read: boolean;
  urgent?: boolean;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "message",
    title: "새 메시지가 도착했습니다",
    description: "헌터#7823님이 채팅방에 메시지를 보냈습니다",
    time: "방금",
    read: false,
  },
  {
    id: 2,
    type: "quest",
    title: "긴급 퀘스트 발생!",
    description: "안양역 근처 맥북 프로 분실 - 보상 100,000 KRW",
    time: "15분 전",
    read: false,
    urgent: true,
  },
  {
    id: 3,
    type: "reward",
    title: "포인트 지급 완료",
    description: "검은색 가죽 지갑 발견 보상 +20,000 P",
    time: "2시간 전",
    read: true,
  },
  {
    id: 4,
    type: "message",
    title: "채팅방에 새 참여자",
    description: "헌터#2941님이 채팅방에 참여했습니다",
    time: "3시간 전",
    read: true,
  },
  {
    id: 5,
    type: "alert",
    title: "AI 매칭 결과",
    description: "등록한 분실물과 94% 일치하는 습득물이 발견되었습니다",
    time: "어제",
    read: true,
  },
  {
    id: 6,
    type: "reward",
    title: "주간 보너스 지급",
    description: "이번 주 활동 보상 +5,000 P",
    time: "2일 전",
    read: true,
  },
  {
    id: 7,
    type: "quest",
    title: "퀘스트 완료",
    description: "소니 카메라 렌즈 발견 퀘스트가 완료되었습니다",
    time: "3일 전",
    read: true,
  },
];

interface NotificationScreenProps {
  onClose: () => void;
}

export function NotificationScreen({ onClose }: NotificationScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return { icon: MessageCircle, color: "#7C3AED" };
      case "quest":
        return { icon: Target, color: "#F59E0B" };
      case "reward":
        return { icon: Gift, color: "#10B981" };
      case "alert":
        return { icon: AlertCircle, color: "#EF4444" };
      default:
        return { icon: Bell, color: "#9CA3AF" };
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "#ffffff" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
      >
        <div>
          <h2 className="text-[18px] mb-0.5" style={{ fontWeight: 800, letterSpacing: "-0.5px", color: "#111827" }}>
            알림
          </h2>
          {unreadCount > 0 && (
            <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
              읽지 않은 알림 {unreadCount}개
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "#F3F4F6", border: "1px solid rgba(0,0,0,0.08)" }}
        >
          <X size={18} style={{ color: "#6B7280" }} />
        </button>
      </div>

      {/* Mark All as Read Button */}
      {unreadCount > 0 && (
        <div className="px-4 py-2 flex-shrink-0">
          <button
            onClick={handleMarkAllAsRead}
            className="w-full px-3 py-2 rounded-lg text-[12px] flex items-center justify-center gap-2"
            style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)", color: "#7C3AED", fontWeight: 600 }}
          >
            <CheckCircle2 size={14} />
            모두 읽음으로 표시
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", background: "#F9FAFB" }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "#F3F4F6" }}
            >
              <Bell size={28} style={{ color: "#9CA3AF" }} />
            </div>
            <p className="text-[14px] mb-1" style={{ fontWeight: 600, color: "#111827" }}>
              알림이 없습니다
            </p>
            <p className="text-[12px] text-center" style={{ color: "#9CA3AF" }}>
              새로운 알림이 도착하면 여기에 표시됩니다
            </p>
          </div>
        ) : (
          <div className="px-4 py-2">
            {notifications.map((notification) => {
              const { icon: Icon, color } = getNotificationIcon(notification.type);

              return (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  className="mb-2 rounded-xl p-3 relative cursor-pointer transition-all"
                  style={{
                    background: notification.read ? "#ffffff" : "#ffffff",
                    border: notification.urgent
                      ? "1px solid rgba(245,158,11,0.4)"
                      : notification.read
                      ? "1px solid rgba(0,0,0,0.06)"
                      : "1px solid rgba(0,0,0,0.1)",
                    boxShadow: notification.read ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Urgent Badge */}
                  {notification.urgent && (
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: "linear-gradient(90deg, transparent, #F59E0B, #D97706, transparent)", borderRadius: "12px 12px 0 0" }}
                    />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}12` }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p
                          className="text-[13px] flex-1"
                          style={{ fontWeight: notification.read ? 500 : 700, color: "#111827" }}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                            style={{ background: "#7C3AED" }}
                          />
                        )}
                      </div>

                      <p
                        className="text-[12px] mb-2"
                        style={{ color: "#9CA3AF", lineHeight: "1.4" }}
                      >
                        {notification.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: "#D1D5DB" }}>
                          {notification.time}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="px-2 py-1 rounded text-[10px]"
                          style={{ color: "#9CA3AF", fontWeight: 600 }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
