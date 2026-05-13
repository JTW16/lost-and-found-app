import { useState, useEffect } from "react";
import { Search, Bell, Home, Map, MessageCircle, User, Plus, MapPin, Zap, ChevronRight, FileSearch, Users2, Package, X } from "lucide-react";
import { LostOwnerScreen } from "./components/LostOwnerScreen";
import { FinderScreen } from "./components/FinderScreen";
import { GoodSamaritanScreen } from "./components/GoodSamaritanScreen";
import { MapScreen } from "./components/MapScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { NotificationScreen } from "./components/NotificationScreen";
import { SearchScreen } from "./components/SearchScreen";
import { PointStoreScreen } from "./components/PointStoreScreen";
import { useAuth } from "./context/AuthContext";
import { AuthScreen } from "./screens/AuthScreen";
import { useAppContext, Quest } from "./context/AppContext";

// ─── Data ────────────────────────────────────────────────────────────────────

const FILTER_CHIPS = [
  { id: "nearest", label: "📍 근처 순" },
  { id: "reward", label: "💰 고액 보상" },
  { id: "electronics", label: "💻 전자기기" },
  { id: "urgent", label: "🔥 긴급" },
  { id: "pets", label: "🐾 반려동물" },
];

// ─── Countdown Timer Display ──────────────────────────────────────────────────

function TimerBadge({ time }: { time: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
      <Zap size={10} style={{ color: "#EF4444" }} />
      <span className="text-[11px] tabular-nums" style={{ color: "#EF4444", fontWeight: 700 }}>{time}</span>
    </div>
  );
}

// ─── Premium Quest Card ───────────────────────────────────────────────────────

function PremiumQuestCard({ quest }: { quest: Quest }) {
  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden relative"
      style={{
        border: "1.5px solid rgba(245,158,11,0.4)",
        boxShadow: "0 0 24px rgba(245,158,11,0.1), 0 8px 32px rgba(0,0,0,0.08)",
        background: "#ffffff",
      }}
    >
      {/* Shimmer top border accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-20" style={{ background: "linear-gradient(90deg, transparent, #F59E0B, #D97706, transparent)" }} />

      {/* Photo */}
      <div className="relative" style={{ height: "200px" }}>
        <img src={quest.image} alt={quest.title} className="w-full h-full object-cover" />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.72) 100%)" }} />

        {/* Top-left: timer */}
        {quest.timeLeft && (
          <div className="absolute top-3 left-3 z-10">
            <TimerBadge time={quest.timeLeft} />
          </div>
        )}

        {/* Top-right: category pill */}
        <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-[10px]" style={{ background: "rgba(124,58,237,0.85)", color: "#EDE9FE", fontWeight: 700, backdropFilter: "blur(6px)", border: "1px solid rgba(167,139,250,0.5)" }}>
          {quest.category}
        </div>

        {/* Reward overlay bar */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 z-10 flex items-center justify-between">
          <span className="text-[22px]" style={{ fontWeight: 900, color: "#F59E0B", textShadow: "0 0 20px rgba(245,158,11,0.6)", letterSpacing: "-0.5px" }}>
            🔥 긴급: 💰 {quest.reward} KRW
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 pt-3 pb-4">
        {/* Premium badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md mb-2.5" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))", border: "1px solid rgba(245,158,11,0.4)" }}>
          <span className="text-[10px]" style={{ color: "#D97706", fontWeight: 800, letterSpacing: "0.08em" }}>⭐ PREMIUM S.O.S</span>
        </div>

        <p className="text-[16px] mb-2" style={{ fontWeight: 700, lineHeight: "1.3", color: "#111827" }}>
          {quest.title}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} style={{ color: "#9CA3AF" }} />
            <span className="text-[12px]" style={{ color: "#6B7280" }}>{quest.location}</span>
            <span style={{ color: "#D1D5DB" }}>•</span>
            <span className="text-[12px]" style={{ color: "#10B981", fontWeight: 600 }}>{quest.distance}</span>
          </div>
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px]"
            style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#1a1200", fontWeight: 800 }}
          >
            수락하기 <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Regular Quest Row ────────────────────────────────────────────────────────

function RegularQuestRow({ quest }: { quest: Quest }) {
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3 active:opacity-70 transition-opacity text-left"
      style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <div className="w-[60px] h-[60px] rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(0,0,0,0.08)" }}>
          <img src={quest.image} alt={quest.title} className="w-full h-full object-cover" />
        </div>
        {quest.isNew && (
          <span
            className="absolute -top-1 -right-1 text-[9px] px-1 py-0.5 rounded"
            style={{ background: "#7C3AED", color: "white", fontWeight: 800, lineHeight: 1 }}
          >
            NEW
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Badge */}
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded mb-1" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)" }}>
          <span className="text-[9px]" style={{ color: "#7C3AED", fontWeight: 700, letterSpacing: "0.06em" }}>📌 S.O.S</span>
        </div>
        <p className="text-[13px] truncate" style={{ fontWeight: 600, color: "#111827" }}>{quest.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin size={10} style={{ color: "#9CA3AF" }} />
          <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{quest.location}</span>
          <span style={{ color: "#D1D5DB", fontSize: "10px" }}>•</span>
          <span className="text-[11px]" style={{ color: "#10B981", fontWeight: 600 }}>{quest.distance}</span>
        </div>
      </div>

      {/* Reward */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span className="text-[15px]" style={{ color: "#F59E0B", fontWeight: 800, letterSpacing: "-0.3px" }}>
          💰 {quest.rewardShort}
        </span>
        <span className="text-[10px]" style={{ color: "#9CA3AF" }}>KRW</span>
      </div>
    </button>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

type Screen = "home" | "lost-owner" | "finder" | "good-samaritan" | "map" | "profile" | "notification" | "search" | "point-store";

export default function App() {
  const { currentUser, userProfile, loading } = useAuth();
  const [activeFilter, setActiveFilter] = useState("nearest");
  const [activeNav, setActiveNav] = useState("home");
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [showActionMenu, setShowActionMenu] = useState(false);
  const { quests, premiumQuest, userPoints, setUserPoints } = useAppContext();

  // 로그인한 유저의 포인트를 Firestore에서 동기화
  useEffect(() => {
    if (userProfile) {
      setUserPoints(userProfile.points);
    }
  }, [userProfile]);

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFFBEB" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 8px 24px rgba(245,158,11,0.4)" }}>
            <svg width="28" height="28" viewBox="0 0 18 18" fill="none"><path d="M9 2L11 7H16.5L12 10.5L14 16L9 12.5L4 16L6 10.5L1.5 7H7L9 2Z" fill="#1a1200"/></svg>
          </div>
          <p className="text-[14px]" style={{ color: "#9CA3AF" }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인 안 된 상태
  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 50%, #f0f0f0 100%)" }}
    >
      {/* Phone Frame */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "44px",
          background: "#ffffff",
          boxShadow: "0 40px 100px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-8 pt-4 pb-1 flex-shrink-0">
          <span className="text-[12px]" style={{ color: "#374151", fontWeight: 600 }}>9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="3" width="3" height="9" rx="1" fill="#374151"/>
              <rect x="4.5" y="2" width="3" height="10" rx="1" fill="#374151"/>
              <rect x="9" y="0.5" width="3" height="11.5" rx="1" fill="#374151"/>
              <rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="#374151" opacity="0.3"/>
            </svg>
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
              <path d="M7.5 2.5C9.8 2.5 11.8 3.5 13.2 5.1L14.5 3.7C12.7 1.8 10.2 0.5 7.5 0.5C4.8 0.5 2.3 1.8 0.5 3.7L1.8 5.1C3.2 3.5 5.2 2.5 7.5 2.5Z" fill="#374151"/>
              <path d="M7.5 5.5C9 5.5 10.3 6.1 11.3 7.1L12.6 5.7C11.2 4.3 9.4 3.5 7.5 3.5C5.6 3.5 3.8 4.3 2.4 5.7L3.7 7.1C4.7 6.1 6 5.5 7.5 5.5Z" fill="#374151"/>
              <circle cx="7.5" cy="10" r="1.5" fill="#374151"/>
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#374151" strokeOpacity="0.35"/>
              <rect x="2" y="2" width="16" height="8" rx="2" fill="#374151"/>
              <path d="M23 4.5V7.5C23.8 7.2 24.5 6.5 24.5 6C24.5 5.5 23.8 4.8 23 4.5Z" fill="#374151" fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* ── Top App Bar ── */}
        <div className="flex items-center justify-between px-5 pt-1 pb-3 flex-shrink-0">
          <button onClick={() => setCurrentScreen("home")} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L11 7H16.5L12 10.5L14 16L9 12.5L4 16L6 10.5L1.5 7H7L9 2Z" fill="#1a1200"/>
              </svg>
            </div>
            <div>
              <span className="text-[19px]" style={{ fontWeight: 900, letterSpacing: "-0.5px", color: "#111827" }}>
                {userPoints.toLocaleString()} <span style={{ color: "#F59E0B" }}>P</span>
              </span>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentScreen("search")}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#F3F4F6", border: "1px solid rgba(0,0,0,0.07)" }}
            >
              <Search size={16} style={{ color: "#6B7280" }} />
            </button>
            <button
              onClick={() => setCurrentScreen("notification")}
              className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{ background: "#F3F4F6", border: "1px solid rgba(0,0,0,0.07)" }}
            >
              <Bell size={16} style={{ color: "#6B7280" }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#EF4444", border: "1.5px solid #ffffff" }} />
            </button>
          </div>
        </div>

        {/* ── Content Area ── */}
        {currentScreen === "home" && (
          <>
            {/* ── Live stats strip ── */}
            <div className="mx-4 mb-3 rounded-xl px-4 py-2.5 flex items-center justify-between flex-shrink-0" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10B981" }} />
                <span className="text-[11px]" style={{ color: "#6B7280" }}>활성 퀘스트</span>
                <span className="text-[12px]" style={{ color: "#F59E0B", fontWeight: 800 }}>{quests.length + (premiumQuest ? 1 : 0)}개</span>
              </div>
              <div className="w-px h-3" style={{ background: "rgba(0,0,0,0.1)" }} />
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]" style={{ color: "#6B7280" }}>오늘 보상 지급</span>
                <span className="text-[12px]" style={{ color: "#10B981", fontWeight: 800 }}>1,240,000 KRW</span>
              </div>
            </div>

            {/* ── Filter Chips ── */}
            <div className="flex-shrink-0">
              <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {FILTER_CHIPS.map((chip) => {
                  const isActive = activeFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => setActiveFilter(chip.id)}
                      className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] transition-all duration-150"
                      style={
                        isActive
                          ? { background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#1a1200", fontWeight: 700, boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }
                          : { background: "#F3F4F6", color: "#6B7280", fontWeight: 500, border: "1px solid rgba(0,0,0,0.07)" }
                      }
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Section Label ── */}
            <div className="flex items-center justify-between px-4 mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #F59E0B, #D97706)" }} />
                <span className="text-[13px]" style={{ fontWeight: 700, color: "#111827" }}>긴급 퀘스트 보드</span>
              </div>
              <button className="text-[11px]" style={{ color: "#7C3AED", fontWeight: 600 }}>전체보기 →</button>
            </div>

            {/* ── Feed ── */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {/* Premium Card */}
              {premiumQuest && <PremiumQuestCard quest={premiumQuest} />}

              {/* Divider */}
              <div className="flex items-center gap-3 px-4 my-4">
                <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.07)" }} />
                <span className="text-[10px] px-2 py-1 rounded-full" style={{ color: "#9CA3AF", background: "#F3F4F6", border: "1px solid rgba(0,0,0,0.07)", fontWeight: 600, letterSpacing: "0.07em" }}>
                  일반 퀘스트
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.07)" }} />
              </div>

              {/* Regular rows container */}
              <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                {quests.map((quest) => (
                  <RegularQuestRow key={quest.id} quest={quest} />
                ))}
              </div>

              {/* Bottom padding */}
              <div className="h-24" />
            </div>
          </>
        )}

        {currentScreen === "lost-owner" && (
          <div className="flex-1 overflow-hidden">
            <LostOwnerScreen onSuccess={() => setCurrentScreen("home")} />
          </div>
        )}

        {currentScreen === "finder" && (
          <div className="flex-1 overflow-hidden">
            <FinderScreen onNavigateToPointStore={() => setCurrentScreen("point-store")} />
          </div>
        )}

        {currentScreen === "good-samaritan" && (
          <div className="flex-1 overflow-hidden">
            <GoodSamaritanScreen />
          </div>
        )}

        {currentScreen === "map" && (
          <div className="flex-1 overflow-hidden">
            <MapScreen />
          </div>
        )}

        {currentScreen === "profile" && (
          <div className="flex-1 overflow-hidden">
            <ProfileScreen />
          </div>
        )}

        {currentScreen === "notification" && (
          <div className="flex-1 overflow-hidden">
            <NotificationScreen onClose={() => setCurrentScreen("home")} />
          </div>
        )}

        {currentScreen === "search" && (
          <div className="flex-1 overflow-hidden">
            <SearchScreen onClose={() => setCurrentScreen("home")} />
          </div>
        )}

        {currentScreen === "point-store" && (
          <div className="flex-1 overflow-hidden">
            <PointStoreScreen onBack={() => setCurrentScreen("finder")} />
          </div>
        )}

        {/* ── FAB ── */}
        <button
          onClick={() => setShowActionMenu(!showActionMenu)}
          className="absolute flex items-center justify-center rounded-full active:scale-95 transition-transform duration-100"
          style={{
            width: "58px",
            height: "58px",
            bottom: "88px",
            right: "22px",
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            boxShadow: "0 0 0 4px rgba(245,158,11,0.15), 0 8px 28px rgba(245,158,11,0.4)",
            zIndex: 30,
          }}
        >
          {showActionMenu ? (
            <X size={26} color="#1a1200" strokeWidth={3} />
          ) : (
            <Plus size={26} color="#1a1200" strokeWidth={3} />
          )}
        </button>

        {/* ── Action Menu ── */}
        {showActionMenu && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 z-20"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowActionMenu(false)}
            />

            {/* Menu */}
            <div
              className="absolute z-25 rounded-t-3xl overflow-hidden"
              style={{
                bottom: 0,
                left: 0,
                right: 0,
                background: "#ffffff",
                borderTop: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 -8px 32px rgba(0,0,0,0.1)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              <div className="px-5 pt-6 pb-2">
                <h3 className="text-[18px] mb-1" style={{ fontWeight: 800, color: "#111827" }}>무엇을 도와드릴까요?</h3>
                <p className="text-[12px] mb-4" style={{ color: "#6B7280" }}>원하는 작업을 선택하세요</p>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => {
                      setCurrentScreen("lost-owner");
                      setShowActionMenu(false);
                    }}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                    style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(239,68,68,0.1)" }}
                    >
                      <FileSearch size={22} style={{ color: "#EF4444" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] mb-0.5" style={{ fontWeight: 700, color: "#111827" }}>분실물 등록하기</p>
                      <p className="text-[11px]" style={{ color: "#6B7280" }}>물건을 잃어버렸어요</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentScreen("finder");
                      setShowActionMenu(false);
                    }}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                    style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(245,158,11,0.12)" }}
                    >
                      <Users2 size={22} style={{ color: "#F59E0B" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] mb-0.5" style={{ fontWeight: 700, color: "#111827" }}>분실물 찾아주기</p>
                      <p className="text-[11px]" style={{ color: "#6B7280" }}>헌터로 활동하고 싶어요</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentScreen("good-samaritan");
                      setShowActionMenu(false);
                    }}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                    style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(124,58,237,0.1)" }}
                    >
                      <Package size={22} style={{ color: "#7C3AED" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] mb-0.5" style={{ fontWeight: 700, color: "#111827" }}>습득물 등록하기</p>
                      <p className="text-[11px]" style={{ color: "#6B7280" }}>물건을 주웠어요</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Bottom Navigation ── */}
        <div
          className="flex-shrink-0 flex items-center justify-around"
          style={{
            height: "76px",
            paddingBottom: "10px",
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {[
            { id: "home", icon: Home, label: "홈" },
            { id: "map", icon: Map, label: "지도" },
            { id: "chat", icon: MessageCircle, label: "채팅" },
            { id: "profile", icon: User, label: "프로필" },
          ].map(({ id, icon: Icon, label }) => {
            const isActive = activeNav === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveNav(id);
                  if (id === "home") {
                    setCurrentScreen("home");
                  } else if (id === "map") {
                    setCurrentScreen("map");
                  } else if (id === "profile") {
                    setCurrentScreen("profile");
                  }
                }}
                className="flex flex-col items-center gap-1 w-16 pt-2 active:opacity-70 transition-opacity"
              >
                <div className="relative">
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-full opacity-20 blur-md"
                      style={{ background: "#F59E0B", transform: "scale(2)" }}
                    />
                  )}
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    style={{ color: isActive ? "#F59E0B" : "#9CA3AF", position: "relative" }}
                  />
                </div>
                <span
                  className="text-[10px]"
                  style={{ color: isActive ? "#F59E0B" : "#9CA3AF", fontWeight: isActive ? 700 : 400 }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
