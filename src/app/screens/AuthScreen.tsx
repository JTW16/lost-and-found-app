import { useAuth } from "../context/AuthContext";
import { MapPin, Shield, Zap } from "lucide-react";

export function AuthScreen() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #1a1200 0%, #2d1f00 50%, #1a1200 100%)" }}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "390px",
          minHeight: "844px",
          borderRadius: "44px",
          background: "#ffffff",
          boxShadow: "0 40px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.08)",
          justifyContent: "space-between",
        }}
      >
        {/* 상단 히어로 영역 */}
        <div
          className="flex flex-col items-center justify-center px-8 pt-20 pb-12"
          style={{ background: "linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 60%, #ffffff 100%)" }}
        >
          {/* 로고 */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              boxShadow: "0 8px 32px rgba(245,158,11,0.4)",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L11 7H16.5L12 10.5L14 16L9 12.5L4 16L6 10.5L1.5 7H7L9 2Z" fill="#1a1200" />
            </svg>
          </div>

          <h1 className="text-[32px] mb-2" style={{ fontWeight: 900, letterSpacing: "-1px", color: "#111827" }}>
            Find<span style={{ color: "#F59E0B" }}>It</span>
          </h1>
          <span
            className="text-[11px] px-3 py-1 rounded-full mb-6"
            style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED", fontWeight: 700, border: "1px solid rgba(124,58,237,0.25)" }}
          >
            BOUNTY PLATFORM
          </span>

          <p className="text-[16px] text-center" style={{ color: "#374151", lineHeight: "1.6", fontWeight: 500 }}>
            잃어버린 물건을 찾아주고<br />
            <span style={{ color: "#F59E0B", fontWeight: 800 }}>보상금</span>을 받아보세요
          </p>
        </div>

        {/* 기능 소개 카드 */}
        <div className="px-6 space-y-3">
          {[
            { icon: MapPin, color: "#EF4444", bg: "rgba(239,68,68,0.08)", title: "분실물 등록", desc: "물건을 잃어버렸다면 퀘스트를 등록하세요" },
            { icon: Zap, color: "#F59E0B", bg: "rgba(245,158,11,0.08)", title: "헌터로 활동", desc: "주변 분실물을 찾아주고 보상금을 받으세요" },
            { icon: Shield, color: "#7C3AED", bg: "rgba(124,58,237,0.08)", title: "안전한 익명 채팅", desc: "신원을 보호하면서 연락을 주고받아요" },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: bg, border: `1px solid ${color}22` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="text-[14px]" style={{ fontWeight: 700, color: "#111827" }}>{title}</p>
                <p className="text-[12px]" style={{ color: "#6B7280" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 로그인 버튼 */}
        <div className="px-6 pb-12 pt-6">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
            style={{
              background: loading ? "#F3F4F6" : "#ffffff",
              border: "1.5px solid rgba(0,0,0,0.12)",
              boxShadow: loading ? "none" : "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            {/* 구글 로고 */}
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-[16px]" style={{ fontWeight: 700, color: loading ? "#9CA3AF" : "#111827" }}>
              {loading ? "로딩 중..." : "Google로 시작하기"}
            </span>
          </button>

          <p className="text-center text-[11px] mt-4" style={{ color: "#9CA3AF" }}>
            시작하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
