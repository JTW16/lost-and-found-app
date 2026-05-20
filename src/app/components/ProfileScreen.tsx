import { User, Award, Coins, TrendingUp, Settings, LogOut, ChevronRight, Shield, Star, Target, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

const ACHIEVEMENTS = [
  { id: 1, icon: "🏆", title: "첫 퀘스트", desc: "첫 번째 분실물 발견", unlocked: true },
  { id: 2, icon: "⭐", title: "헌터 5회", desc: "5개 퀘스트 완료", unlocked: true },
  { id: 3, icon: "💎", title: "전설의 헌터", desc: "10개 퀘스트 완료", unlocked: false },
  { id: 4, icon: "🔥", title: "연속 달성", desc: "7일 연속 활동", unlocked: true },
];

const RANK_TIERS = [
  { name: "브론즈", min: 0, color: "#cd7f32" },
  { name: "실버", min: 10000, color: "#8B95A1" },
  { name: "골드", min: 50000, color: "#F59E0B" },
  { name: "플래티넘", min: 100000, color: "#7C3AED" },
  { name: "다이아몬드", min: 200000, color: "#3B82F6" },
];

export function ProfileScreen() {
  const { currentUser, userProfile, logout } = useAuth();
  const { quests, userPoints } = useAppContext();

  // 내가 등록한 퀘스트 목록
  const myQuests = quests.filter((q) => q.uid === currentUser?.uid);

  // 등급 계산
  const currentTier =
    RANK_TIERS.slice()
      .reverse()
      .find((tier) => userPoints >= tier.min) || RANK_TIERS[0];
  const nextTier = RANK_TIERS[RANK_TIERS.indexOf(currentTier) + 1];
  const progressToNext = nextTier
    ? ((userPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const displayName = userProfile?.displayName ?? currentUser?.displayName ?? "익명 사용자";
  const photoURL = userProfile?.photoURL ?? currentUser?.photoURL ?? "";
  const email = userProfile?.email ?? currentUser?.email ?? "";

  const handleLogout = () => {
    toast("로그아웃 하시겠습니까?", {
      action: {
        label: "로그아웃",
        onClick: () => logout(),
      },
      cancel: {
        label: "취소",
        onClick: () => {},
      },
      duration: 5000,
    });
  };

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none", background: "#ffffff" }}>
      {/* Profile Header */}
      <div
        className="px-5 pt-6 pb-4"
        style={{
          background: "linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 100%)",
          borderBottom: "1px solid rgba(245,158,11,0.15)",
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover"
                style={{ boxShadow: "0 8px 24px rgba(245,158,11,0.35)", border: "3px solid rgba(245,158,11,0.3)" }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 8px 24px rgba(245,158,11,0.35)" }}
              >
                <User size={36} style={{ color: "#1a1200" }} />
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", border: "2px solid #ffffff" }}
            >
              <span className="text-[11px] text-white" style={{ fontWeight: 900 }}>
                {myQuests.length + 1}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-[20px] mb-0.5" style={{ fontWeight: 900, letterSpacing: "-0.5px", color: "#111827" }}>
              {displayName}
            </h2>
            <p className="text-[11px] mb-2" style={{ color: "#9CA3AF" }}>{email}</p>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-md"
                style={{ background: `${currentTier.color}18`, border: `1px solid ${currentTier.color}40` }}
              >
                <Crown size={12} style={{ color: currentTier.color }} />
                <span className="text-[11px]" style={{ color: currentTier.color, fontWeight: 700 }}>
                  {currentTier.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={12} style={{ color: "#F59E0B" }} />
                <span className="text-[11px]" style={{ color: "#6B7280" }}>
                  평점 4.8
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => toast.info("준비 중입니다 🚀", { description: "설정 기능은 곧 출시됩니다!" })}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#F3F4F6", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <Settings size={18} style={{ color: "#6B7280" }} />
          </button>
        </div>

        {/* Tier Progress */}
        {nextTier && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px]" style={{ color: "#9CA3AF" }}>
                다음 등급까지
              </span>
              <span className="text-[11px]" style={{ color: "#F59E0B", fontWeight: 700 }}>
                {(nextTier.min - userPoints).toLocaleString()} P 남음
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(progressToNext, 100)}%`,
                  background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`,
                  boxShadow: `0 0 8px ${currentTier.color}60`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl p-3 text-center" style={{ background: "#FFFBEB", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div className="flex items-center justify-center mb-1">
              <Coins size={16} style={{ color: "#F59E0B" }} />
            </div>
            <p className="text-[16px] mb-0.5" style={{ fontWeight: 800, letterSpacing: "-0.3px", color: "#111827" }}>
              {userPoints.toLocaleString()}
            </p>
            <p className="text-[10px]" style={{ color: "#9CA3AF" }}>포인트</p>
          </div>

          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <div className="flex items-center justify-center mb-1">
              <Target size={16} style={{ color: "#7C3AED" }} />
            </div>
            <p className="text-[16px] mb-0.5" style={{ fontWeight: 800, letterSpacing: "-0.3px", color: "#111827" }}>
              {myQuests.length}
            </p>
            <p className="text-[10px]" style={{ color: "#9CA3AF" }}>내 퀘스트</p>
          </div>

          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div className="flex items-center justify-center mb-1">
              <TrendingUp size={16} style={{ color: "#10B981" }} />
            </div>
            <p className="text-[16px] mb-0.5" style={{ fontWeight: 800, letterSpacing: "-0.3px", color: "#111827" }}>
              92%
            </p>
            <p className="text-[10px]" style={{ color: "#9CA3AF" }}>성공률</p>
          </div>
        </div>
      </div>

      {/* My Quests */}
      {myQuests.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #F59E0B, #D97706)" }} />
            <span className="text-[14px]" style={{ fontWeight: 700, color: "#111827" }}>
              내가 등록한 퀘스트
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED", fontWeight: 700 }}>
              {myQuests.length}개
            </span>
          </div>
          <div className="space-y-2">
            {myQuests.map((quest) => (
              <div
                key={quest.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.07)" }}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={quest.image} alt={quest.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate" style={{ fontWeight: 600, color: "#111827" }}>{quest.title}</p>
                  <p className="text-[11px]" style={{ color: "#9CA3AF" }}>{quest.location}</p>
                </div>
                <span className="text-[13px]" style={{ color: "#F59E0B", fontWeight: 700 }}>
                  💰 {quest.rewardShort}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #F59E0B, #D97706)" }} />
          <span className="text-[14px]" style={{ fontWeight: 700, color: "#111827" }}>업적</span>
          <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED", fontWeight: 700 }}>
            {ACHIEVEMENTS.filter((a) => a.unlocked).length}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map((achievement) => (
            <div
              key={achievement.id}
              className="rounded-xl p-3"
              style={{
                background: achievement.unlocked ? "#FFFBEB" : "#F9FAFB",
                border: achievement.unlocked ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(0,0,0,0.06)",
                opacity: achievement.unlocked ? 1 : 0.5,
              }}
            >
              <div className="text-[24px] mb-1">{achievement.icon}</div>
              <p className="text-[12px] mb-0.5" style={{ fontWeight: 600, color: "#111827" }}>{achievement.title}</p>
              <p className="text-[10px]" style={{ color: "#9CA3AF" }}>{achievement.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl overflow-hidden" style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}>
          {[
            { icon: Award, label: "내 뱃지", color: "#F59E0B" },
            { icon: TrendingUp, label: "통계 & 리더보드", color: "#7C3AED" },
            { icon: Settings, label: "설정", color: "#6B7280" },
            { icon: Shield, label: "개인정보 보호", color: "#6B7280" },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => toast.info("준비 중입니다 🚀", { description: `${item.label} 기능은 곧 출시됩니다!` })}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left"
              style={{ borderBottom: index < 3 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} style={{ color: item.color }} />
                <span className="text-[14px]" style={{ fontWeight: 500, color: "#111827" }}>{item.label}</span>
              </div>
              <ChevronRight size={16} style={{ color: "#D1D5DB" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[14px]"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontWeight: 600 }}
        >
          <LogOut size={18} />
          로그아웃
        </button>
      </div>

      <div className="h-20" />
    </div>
  );
}
