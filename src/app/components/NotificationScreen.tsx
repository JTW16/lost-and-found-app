import { Bell, MessageCircle, Target, Gift, AlertCircle, X, CheckCircle2, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import { formatRelativeTime } from "../../lib/notifications";

// #8: Firestore 기반 알림 타입
type NotifType = "message" | "quest" | "reward" | "alert" | "match";

interface FirestoreNotification {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  urgent?: boolean;
}

interface NotificationScreenProps {
  onClose: () => void;
}

export function NotificationScreen({ onClose }: NotificationScreenProps) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // #8: Firestore users/{uid}/notifications 실시간 구독
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "users", currentUser.uid, "notifications"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: FirestoreNotification[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          type: (data.type ?? "alert") as NotifType,
          title: data.title ?? "",
          description: data.description ?? "",
          time: formatRelativeTime(data.createdAt?.toDate()),
          read: data.read ?? false,
          urgent: data.urgent ?? false,
        };
      });
      setNotifications(items);
      setLoading(false);
    }, (err) => {
      console.error("알림 구독 오류:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "users", currentUser.uid, "notifications", id), { read: true });
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    notifications.filter((n) => !n.read).forEach((n) => {
      batch.update(doc(db, "users", currentUser.uid, "notifications", n.id), { read: true });
    });
    await batch.commit();
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, "users", currentUser.uid, "notifications", id));
  };

  const getNotificationIcon = (type: NotifType) => {
    switch (type) {
      case "message": return { icon: MessageCircle, color: "#7C3AED" };
      case "quest": return { icon: Target, color: "#F59E0B" };
      case "reward": return { icon: Gift, color: "#10B981" };
      case "match": return { icon: Zap, color: "#F59E0B" };
      case "alert": return { icon: AlertCircle, color: "#EF4444" };
      default: return { icon: Bell, color: "#9CA3AF" };
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "#ffffff" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <div>
          <h2 className="text-[18px] mb-0.5" style={{ fontWeight: 800, letterSpacing: "-0.5px", color: "#111827" }}>알림</h2>
          {unreadCount > 0 && (
            <p className="text-[11px]" style={{ color: "#9CA3AF" }}>읽지 않은 알림 {unreadCount}개</p>
          )}
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#F3F4F6", border: "1px solid rgba(0,0,0,0.08)" }}>
          <X size={18} style={{ color: "#6B7280" }} />
        </button>
      </div>

      {/* Mark All as Read */}
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
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px]" style={{ color: "#9CA3AF" }}>알림을 불러오는 중...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#F3F4F6" }}>
              <Bell size={28} style={{ color: "#9CA3AF" }} />
            </div>
            <p className="text-[14px] mb-1" style={{ fontWeight: 600, color: "#111827" }}>알림이 없습니다</p>
            <p className="text-[12px] text-center" style={{ color: "#9CA3AF" }}>
              분실물 등록, 매칭 결과, 포인트 지급 알림이 여기에 표시됩니다
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
                    background: "#ffffff",
                    border: notification.urgent
                      ? "1px solid rgba(245,158,11,0.4)"
                      : notification.read
                      ? "1px solid rgba(0,0,0,0.06)"
                      : "1px solid rgba(0,0,0,0.1)",
                    boxShadow: notification.read ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {notification.urgent && (
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #F59E0B, #D97706, transparent)", borderRadius: "12px 12px 0 0" }} />
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}12` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[13px] flex-1" style={{ fontWeight: notification.read ? 500 : 700, color: "#111827" }}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "#7C3AED" }} />
                        )}
                      </div>
                      <p className="text-[12px] mb-2" style={{ color: "#9CA3AF", lineHeight: "1.4" }}>{notification.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: "#D1D5DB" }}>{notification.time}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
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
