import { MessageCircle, MapPin, X, Navigation, Clock } from "lucide-react";
import { Quest } from "../context/AppContext";

interface QuestDetailSheetProps {
  quest: Quest;
  onClose: () => void;
  onChat: (questId: string) => void;
}

export function QuestDetailSheet({ quest, onClose, onChat }: QuestDetailSheetProps) {
  return (
    <>
      {/* 배경 딤 */}
      <div
        className="absolute inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />

      {/* 바텀 시트 */}
      <div
        className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{
          background: "#ffffff",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "#E5E7EB" }} />
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "#F3F4F6" }}
        >
          <X size={16} style={{ color: "#6B7280" }} />
        </button>

        {/* 이미지 */}
        <div className="relative mx-4 mb-4 rounded-2xl overflow-hidden" style={{ height: "180px" }}>
          <img
            src={quest.image}
            alt={quest.title}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)",
            }}
          />
          {/* 카테고리 배지 */}
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px]"
            style={{
              background: "rgba(124,58,237,0.85)",
              color: "#EDE9FE",
              fontWeight: 700,
              backdropFilter: "blur(6px)",
            }}
          >
            {quest.category}
          </div>
          {/* 보상금 */}
          <div className="absolute bottom-3 left-4">
            <span
              className="text-[20px]"
              style={{ fontWeight: 900, color: "#F59E0B", letterSpacing: "-0.5px" }}
            >
              💰 {quest.reward} KRW
            </span>
          </div>
        </div>

        {/* 내용 */}
        <div className="px-5 pb-6">
          <h2 className="text-[17px] mb-3" style={{ fontWeight: 800, color: "#111827" }}>
            {quest.title}
          </h2>

          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color: "#9CA3AF" }} />
              <span className="text-[13px]" style={{ color: "#6B7280" }}>
                {quest.location}
              </span>
              {quest.distance && (
                <>
                  <span style={{ color: "#D1D5DB" }}>•</span>
                  <span className="text-[13px]" style={{ color: "#10B981", fontWeight: 600 }}>
                    {quest.distance}
                  </span>
                </>
              )}
            </div>

            {quest.timeLeft && (
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: "#9CA3AF" }} />
                <span className="text-[13px]" style={{ color: "#EF4444", fontWeight: 600 }}>
                  {quest.timeLeft} 남음
                </span>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onChat(quest.id)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px]"
              style={{
                background: "rgba(124,58,237,0.08)",
                color: "#7C3AED",
                fontWeight: 700,
                border: "1px solid rgba(124,58,237,0.25)",
              }}
            >
              <MessageCircle size={17} />
              채팅하기
            </button>

            <button
              onClick={() =>
                window.open(
                  `https://map.kakao.com/link/search/${encodeURIComponent(quest.location)}`,
                  "_blank"
                )
              }
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px]"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "#1a1200",
                fontWeight: 800,
                boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
              }}
            >
              <Navigation size={17} />
              위치 안내
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
