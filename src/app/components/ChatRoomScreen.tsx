import { ArrowLeft, Users, Send, MapPin, Coins, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";

// 채팅방 ID (추후 동적으로 변경 가능)
const CHAT_ID = "quest-wallet-1";

// 샘플 분실물 데이터
const LOST_ITEM = {
  id: 2,
  image: "https://images.unsplash.com/photo-1629958513881-a086d21383cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxibGFjayUyMGxlYXRoZXIlMjB3YWxsZXR8ZW58MXx8fHwxNzc1ODg3ODQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  title: "검은색 가죽 지갑",
  location: "범계역 3번 출구",
  reward: "20,000",
  distance: "650m",
};

type Message = {
  id: string;
  type: "system" | "user" | "me";
  username?: string;
  content: string;
  timestamp: string;
  uid?: string;
};

interface ChatRoomScreenProps {
  onBack: () => void;
}

export function ChatRoomScreen({ onBack }: ChatRoomScreenProps) {
  const { currentUser, userProfile } = useAuth();
  const myName = userProfile?.displayName ?? currentUser?.displayName ?? "나";
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showItemInfo, setShowItemInfo] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [participantCount] = useState(3);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);

  // Firestore 실시간 메시지 구독
  useEffect(() => {
    const q = query(
      collection(db, "chats", CHAT_ID, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.uid === currentUser?.uid ? "me" : (data.type ?? "user"),
          username: data.username,
          content: data.content,
          timestamp: data.timestamp ?? "",
          uid: data.uid,
        };
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [currentUser?.uid]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 타이핑 시뮬레이션
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        setIsTyping(Math.random() > 0.7);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || sending) return;
    setSending(true);
    const text = inputValue.trim();
    setInputValue("");
    try {
      await addDoc(collection(db, "chats", CHAT_ID, "messages"), {
        content: text,
        type: "me",
        username: myName,
        uid: currentUser?.uid ?? "anonymous",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("메시지 전송 실패:", e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "#ffffff" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", background: "#ffffff" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#F3F4F6", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <ArrowLeft size={18} style={{ color: "#6B7280" }} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px]" style={{ fontWeight: 700, color: "#111827" }}>
                익명 채팅방
              </h2>
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)" }}
              >
                <Users size={10} style={{ color: "#7C3AED" }} />
                <span className="text-[10px]" style={{ color: "#7C3AED", fontWeight: 700 }}>
                  {participantCount}
                </span>
              </div>
            </div>
            <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
              {LOST_ITEM.title}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowItemInfo(!showItemInfo)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "#F3F4F6", border: "1px solid rgba(0,0,0,0.08)" }}
        >
          <Info size={16} style={{ color: "#6B7280" }} />
        </button>
      </div>

      {/* Lost Item Info Card (Collapsible) */}
      {showItemInfo && (
        <div className="flex-shrink-0 px-4 pt-3 pb-2">
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "#FFFBEB", border: "1px solid rgba(245,158,11,0.35)" }}
          >
            <div className="flex items-center gap-3 p-3">
              <div
                className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                style={{ border: "1px solid rgba(0,0,0,0.08)" }}
              >
                <img src={LOST_ITEM.image} alt={LOST_ITEM.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded mb-1"
                  style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)" }}
                >
                  <span className="text-[9px]" style={{ color: "#D97706", fontWeight: 700, letterSpacing: "0.05em" }}>
                    💰 현상금 퀘스트
                  </span>
                </div>
                <p className="text-[14px] mb-1" style={{ fontWeight: 700, color: "#111827" }}>
                  {LOST_ITEM.title}
                </p>
                <div className="flex items-center gap-1.5">
                  <MapPin size={10} style={{ color: "#9CA3AF" }} />
                  <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{LOST_ITEM.location}</span>
                  <span style={{ color: "#D1D5DB", fontSize: "10px" }}>•</span>
                  <span className="text-[11px]" style={{ color: "#10B981", fontWeight: 600 }}>{LOST_ITEM.distance}</span>
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col items-end">
                <Coins size={16} style={{ color: "#F59E0B", marginBottom: "2px" }} />
                <span className="text-[16px]" style={{ color: "#F59E0B", fontWeight: 900, letterSpacing: "-0.3px" }}>
                  {LOST_ITEM.reward}
                </span>
                <span className="text-[9px]" style={{ color: "#9CA3AF" }}>KRW</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: "none", background: "#F9FAFB" }}>
        <div className="space-y-3">
          {messages.map((message) => {
            if (message.type === "system") {
              return (
                <div key={message.id} className="flex justify-center">
                  <div
                    className="px-3 py-1.5 rounded-full text-center max-w-[280px]"
                    style={{ background: "#E5E7EB", border: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <p className="text-[11px]" style={{ color: "#6B7280", lineHeight: "1.4" }}>
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            }

            const isMe = message.type === "me";

            return (
              <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  {!isMe && (
                    <div className="flex items-center gap-1.5 px-2">
                      <span className="text-[11px]" style={{ color: "#7C3AED", fontWeight: 700 }}>
                        {message.username}
                      </span>
                      <span className="text-[10px]" style={{ color: "#9CA3AF" }}>
                        {message.timestamp}
                      </span>
                    </div>
                  )}

                  <div
                    className="px-4 py-2.5 rounded-2xl"
                    style={
                      isMe
                        ? {
                            background: "linear-gradient(135deg, #F59E0B, #D97706)",
                            borderBottomRightRadius: "6px",
                          }
                        : {
                            background: "#ffffff",
                            border: "1px solid rgba(0,0,0,0.08)",
                            borderBottomLeftRadius: "6px",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                          }
                    }
                  >
                    <p
                      className="text-[13px]"
                      style={{
                        color: isMe ? "#1a1200" : "#111827",
                        lineHeight: "1.5",
                        fontWeight: isMe ? 600 : 400,
                      }}
                    >
                      {message.content}
                    </p>
                  </div>

                  {isMe && (
                    <div className="px-2">
                      <span className="text-[10px]" style={{ color: "#9CA3AF" }}>
                        {message.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mt-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderBottomLeftRadius: "6px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <span className="text-[11px]" style={{ color: "#7C3AED", fontWeight: 700 }}>헌터#7823</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#9CA3AF", animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#9CA3AF", animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#9CA3AF", animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{
          borderTop: "1px solid rgba(0,0,0,0.07)",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              rows={1}
              className="w-full px-4 py-3 rounded-xl text-[14px] placeholder-gray-400 resize-none"
              style={{
                background: "#F3F4F6",
                border: "1px solid rgba(0,0,0,0.08)",
                outline: "none",
                maxHeight: "100px",
                color: "#111827",
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === ""}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={
              inputValue.trim() === ""
                ? {
                    background: "#F3F4F6",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }
                : {
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
                  }
            }
          >
            <Send size={18} style={{ color: inputValue.trim() === "" ? "#9CA3AF" : "#1a1200" }} />
          </button>
        </div>

        {/* Quick Replies */}
        <div className="flex gap-2 mt-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {["근처에서 활동 중입니다", "확인했습니다", "조금만 기다려주세요"].map((reply, idx) => (
            <button
              key={idx}
              onClick={() => setInputValue(reply)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px]"
              style={{
                background: "rgba(124,58,237,0.07)",
                border: "1px solid rgba(124,58,237,0.2)",
                color: "#7C3AED",
                fontWeight: 600,
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
