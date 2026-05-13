import { ChevronDown, Search, MessageCircle, Flag, Coins, ShoppingBag, MapPin, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { ChatRoomScreen } from "./ChatRoomScreen";

const QUEST_ITEMS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1524226750215-b424f7377a80?w=400",
    title: "맥북 프로 16인치 실버",
    location: "안양역 2번 출구 인근",
    reward: "100,000",
    timeLeft: "2시간 14분",
    urgent: true,
    distance: "300m",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1629958513881-a086d21383cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxibGFjayUyMGxlYXRoZXIlMjB3YWxsZXR8ZW58MXx8fHwxNzc1ODg3ODQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "검은색 가죽 지갑",
    location: "범계역 3번 출구",
    reward: "20,000",
    timeLeft: "5시간 32분",
    urgent: false,
    distance: "650m",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1768081529866-a5ec754fe14c?w=400",
    title: "소니 FE 24-70mm 렌즈",
    location: "인덕원역 근처 카페",
    reward: "50,000",
    timeLeft: "1시간 45분",
    urgent: true,
    distance: "2.1km",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1646848842285-d4c14f43781e?w=400",
    title: "에어팟 프로 2세대",
    location: "평촌중앙공원 벤치",
    reward: "30,000",
    timeLeft: "4시간 20분",
    urgent: false,
    distance: "1.2km",
  },
];

interface FinderScreenProps {
  onNavigateToPointStore?: () => void;
}

export function FinderScreen({ onNavigateToPointStore }: FinderScreenProps = {}) {
  const [selectedRegion, setSelectedRegion] = useState("안양역");
  const [selectedQuest, setSelectedQuest] = useState<number | null>(null);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showChatRoom, setShowChatRoom] = useState(false);

  const regions = ["안양역", "범계역", "인덕원역", "평촌역", "관악산역"];

  if (showChatRoom) {
    return <ChatRoomScreen onBack={() => setShowChatRoom(false)} />;
  }

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none", background: "#ffffff" }}>
      {/* Header with Points */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[22px] mb-1" style={{ fontWeight: 900, letterSpacing: "-0.5px", color: "#111827" }}>
              현상금 게시판
            </h1>
            <p className="text-[13px]" style={{ color: "#6B7280" }}>
              주변 분실물을 찾아 리워드를 받으세요
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 mb-1">
              <Coins size={18} style={{ color: "#F59E0B" }} />
              <span className="text-[20px]" style={{ color: "#F59E0B", fontWeight: 900, letterSpacing: "-0.5px" }}>
                12,500
              </span>
            </div>
            <button
              onClick={onNavigateToPointStore}
              className="px-3 py-1 rounded-md text-[10px] flex items-center gap-1"
              style={{ background: "rgba(245,158,11,0.1)", color: "#D97706", fontWeight: 700, border: "1px solid rgba(245,158,11,0.3)" }}
            >
              <ShoppingBag size={11} />
              포인트 상점
            </button>
          </div>
        </div>
      </div>

      {/* Region Selector */}
      <div className="px-4 mb-3">
        <div className="relative mb-2">
          <button
            onClick={() => setShowRegionDropdown(!showRegionDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px]"
            style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} style={{ color: "#F59E0B" }} />
              <span style={{ fontWeight: 600, color: "#111827" }}>현재 활동 지역: {selectedRegion}</span>
            </div>
            <ChevronDown size={16} style={{ color: "#9CA3AF" }} />
          </button>

          {showRegionDropdown && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-20"
              style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
            >
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => {
                    setSelectedRegion(region);
                    setShowRegionDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-[14px]"
                  style={{ color: region === selectedRegion ? "#F59E0B" : "#6B7280", fontWeight: region === selectedRegion ? 700 : 400, borderBottom: "1px solid rgba(0,0,0,0.05)", background: region === selectedRegion ? "rgba(245,158,11,0.05)" : "transparent" }}
                >
                  {region}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="물건 이름 검색..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] placeholder-gray-400"
            style={{ background: "#F3F4F6", border: "1px solid rgba(0,0,0,0.08)", outline: "none", color: "#111827" }}
          />
        </div>
      </div>

      {/* Quest Cards */}
      <div className="px-4 space-y-3 pb-6">
        {QUEST_ITEMS.map((quest) => {
          const isSelected = selectedQuest === quest.id;

          return (
            <div key={quest.id}>
              <div
                onClick={() => setSelectedQuest(isSelected ? null : quest.id)}
                className="rounded-2xl overflow-hidden cursor-pointer transition-all"
                style={{
                  background: "#ffffff",
                  border: quest.urgent ? "1.5px solid rgba(245,158,11,0.5)" : "1px solid rgba(0,0,0,0.08)",
                  boxShadow: quest.urgent ? "0 4px 20px rgba(245,158,11,0.1)" : "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {quest.urgent && (
                  <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #F59E0B, #D97706, transparent)" }} />
                )}

                <div className="relative h-36">
                  <img src={quest.image} alt={quest.title} className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.65) 100%)" }}
                  />

                  {/* Time Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.12)", backdropFilter: "blur(4px)" }}>
                      <Clock size={12} style={{ color: quest.urgent ? "#EF4444" : "#9CA3AF" }} />
                      <span className="text-[11px]" style={{ color: quest.urgent ? "#EF4444" : "#6B7280", fontWeight: 700 }}>
                        {quest.timeLeft}
                      </span>
                    </div>
                  </div>

                  {quest.urgent && (
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", backdropFilter: "blur(4px)" }}>
                        <Zap size={11} style={{ color: "#EF4444" }} />
                        <span className="text-[10px]" style={{ color: "#EF4444", fontWeight: 800, letterSpacing: "0.05em" }}>긴급</span>
                      </div>
                    </div>
                  )}

                  {/* Reward Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 py-2">
                    <span className="text-[20px]" style={{ fontWeight: 900, color: "#F59E0B", textShadow: "0 0 16px rgba(245,158,11,0.5)" }}>
                      💰 {quest.reward} P
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-[15px] mb-2" style={{ fontWeight: 700, color: "#111827" }}>
                    {quest.title}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} style={{ color: "#9CA3AF" }} />
                    <span className="text-[12px]" style={{ color: "#9CA3AF" }}>{quest.location}</span>
                    <span style={{ color: "#D1D5DB", fontSize: "10px" }}>•</span>
                    <span className="text-[12px]" style={{ color: "#10B981", fontWeight: 600 }}>{quest.distance}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Actions */}
              {isSelected && (
                <div className="mt-2 grid grid-cols-2 gap-2 px-2">
                  <button
                    onClick={() => setShowChatRoom(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px]"
                    style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", fontWeight: 700, border: "1px solid rgba(124,58,237,0.25)" }}
                  >
                    <MessageCircle size={16} />
                    익명 채팅 참여
                  </button>

                  <button
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px]"
                    style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#1a1200", fontWeight: 800 }}
                  >
                    <Flag size={16} />
                    발견 제보하기
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="px-4 pb-6">
        <div
          className="rounded-xl p-4"
          style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)" }}
        >
          <p className="text-[12px] mb-2" style={{ color: "#7C3AED", fontWeight: 700 }}>💡 헌터 팁</p>
          <p className="text-[11px]" style={{ color: "#6B7280", lineHeight: "1.5" }}>
            분실물을 발견하면 사진과 함께 제보해주세요. 확인되면 즉시 포인트가 지급됩니다!
          </p>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}
