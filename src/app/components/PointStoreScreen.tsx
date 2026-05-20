import { ArrowLeft, Coins, Gift, ShoppingBag, Crown, Zap, ChevronRight, Star, Award } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const STORE_ITEMS = [
  {
    id: 1,
    category: "reward",
    name: "스타벅스 아메리카노",
    points: 4500,
    icon: "☕",
    popular: true,
    stock: "무제한",
  },
  {
    id: 2,
    category: "reward",
    name: "GS25 5천원 상품권",
    points: 5000,
    icon: "🏪",
    popular: true,
    stock: "무제한",
  },
  {
    id: 3,
    category: "reward",
    name: "배스킨라빈스 파인트",
    points: 12000,
    icon: "🍦",
    popular: false,
    stock: "무제한",
  },
  {
    id: 4,
    category: "premium",
    name: "프리미엄 상단 노출 (7일)",
    points: 15000,
    icon: "⭐",
    popular: true,
    stock: "무제한",
  },
  {
    id: 5,
    category: "premium",
    name: "긴급 알림 발송권 (5회)",
    points: 10000,
    icon: "🔥",
    popular: false,
    stock: "무제한",
  },
  {
    id: 6,
    category: "badge",
    name: "골드 헌터 뱃지",
    points: 50000,
    icon: "🏆",
    popular: false,
    stock: "한정",
    limited: true,
  },
  {
    id: 7,
    category: "reward",
    name: "쿠팡 1만원 상품권",
    points: 10000,
    icon: "🎁",
    popular: true,
    stock: "무제한",
  },
  {
    id: 8,
    category: "badge",
    name: "전설의 파인더 칭호",
    points: 100000,
    icon: "👑",
    popular: false,
    stock: "한정",
    limited: true,
  },
];

interface PointStoreScreenProps {
  onBack: () => void;
}

export function PointStoreScreen({ onBack }: PointStoreScreenProps) {
  const { userPoints, spendPoints } = useAppContext();
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [purchaseSuccess, setPurchaseSuccess] = useState<number | null>(null);

  const categories = [
    { id: "all", label: "전체", icon: ShoppingBag },
    { id: "reward", label: "리워드", icon: Gift },
    { id: "premium", label: "프리미엄", icon: Crown },
    { id: "badge", label: "뱃지", icon: Award },
  ];

  const filteredItems = STORE_ITEMS.filter((item) =>
    selectedCategory === "all" ? true : item.category === selectedCategory
  );

  const handlePurchase = async (itemId: number, itemPoints: number) => {
    const uid = currentUser?.uid ?? "";
    const success = await spendPoints(uid, itemPoints);
    if (success) {
      setPurchaseSuccess(itemId);
      toast.success("구매 완료! 🎉", { description: "포인트가 차감되었습니다." });
      setTimeout(() => setPurchaseSuccess(null), 2000);
    } else {
      toast.error("포인트가 부족합니다.", { description: `보유 포인트: ${userPoints.toLocaleString()} P` });
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "#ffffff" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
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
            <h2 className="text-[18px]" style={{ fontWeight: 800, letterSpacing: "-0.5px", color: "#111827" }}>
              포인트 상점
            </h2>
            <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
              포인트로 다양한 리워드를 교환하세요
            </p>
          </div>
        </div>
      </div>

      {/* User Points Balance */}
      <div className="px-4 py-3 flex-shrink-0">
        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
            border: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.2)" }}
              >
                <Coins size={24} style={{ color: "#F59E0B" }} />
              </div>
              <div>
                <p className="text-[11px] mb-0.5" style={{ color: "#9CA3AF" }}>
                  보유 포인트
                </p>
                <p className="text-[24px]" style={{ color: "#F59E0B", fontWeight: 900, letterSpacing: "-0.5px" }}>
                  {userPoints.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] mb-1" style={{ color: "#9CA3AF" }}>이번 달 적립</p>
              <p className="text-[14px]" style={{ color: "#10B981", fontWeight: 700 }}>+32,500 P</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {categories.map((category) => {
            const isActive = selectedCategory === category.id;
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-[12px] flex items-center gap-2 transition-all"
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        color: "#1a1200",
                        fontWeight: 700,
                        boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                      }
                    : {
                        background: "#F3F4F6",
                        color: "#6B7280",
                        fontWeight: 500,
                        border: "1px solid rgba(0,0,0,0.07)",
                      }
                }
              >
                <Icon size={14} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Store Items */}
      <div className="flex-1 overflow-y-auto px-4" style={{ scrollbarWidth: "none", background: "#F9FAFB" }}>
        <div className="grid grid-cols-1 gap-3 pb-6 pt-2">
          {filteredItems.map((item) => {
            const canAfford = userPoints >= item.points;
            const isPurchased = purchaseSuccess === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl p-4 relative"
                style={{
                  background: "#ffffff",
                  border: item.popular ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(0,0,0,0.08)",
                  opacity: canAfford ? 1 : 0.6,
                  boxShadow: item.popular ? "0 4px 16px rgba(245,158,11,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* Popular Badge */}
                {item.popular && (
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: "linear-gradient(90deg, transparent, #F59E0B, #D97706, transparent)", borderRadius: "12px 12px 0 0" }}
                  />
                )}

                <div className="flex items-center gap-4">
                  {/* Item Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-[32px]"
                    style={{
                      background:
                        item.category === "premium"
                          ? "rgba(245,158,11,0.1)"
                          : item.category === "badge"
                          ? "rgba(124,58,237,0.1)"
                          : "rgba(16,185,129,0.1)",
                      border:
                        item.category === "premium"
                          ? "1px solid rgba(245,158,11,0.2)"
                          : item.category === "badge"
                          ? "1px solid rgba(124,58,237,0.2)"
                          : "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.popular && (
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(245,158,11,0.1)" }}
                        >
                          <Star size={9} style={{ color: "#F59E0B" }} />
                          <span className="text-[9px]" style={{ color: "#D97706", fontWeight: 700 }}>
                            인기
                          </span>
                        </div>
                      )}
                      {item.limited && (
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(239,68,68,0.1)" }}
                        >
                          <Zap size={9} style={{ color: "#EF4444" }} />
                          <span className="text-[9px]" style={{ color: "#EF4444", fontWeight: 700 }}>
                            한정
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-[14px] mb-1" style={{ fontWeight: 700, color: "#111827" }}>
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Coins size={12} style={{ color: "#F59E0B" }} />
                        <span className="text-[14px]" style={{ color: "#F59E0B", fontWeight: 800 }}>
                          {item.points.toLocaleString()}
                        </span>
                      </div>
                      <span style={{ color: "#D1D5DB", fontSize: "10px" }}>•</span>
                      <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{item.stock}</span>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchase(item.id, item.points)}
                    disabled={!canAfford || isPurchased}
                    className="flex-shrink-0 px-4 py-2 rounded-lg text-[12px] flex items-center gap-1 transition-all"
                    style={
                      isPurchased
                        ? {
                            background: "rgba(16,185,129,0.12)",
                            color: "#10B981",
                            fontWeight: 700,
                            border: "1px solid rgba(16,185,129,0.3)",
                          }
                        : canAfford
                        ? {
                            background: "linear-gradient(135deg, #F59E0B, #D97706)",
                            color: "#1a1200",
                            fontWeight: 800,
                          }
                        : {
                            background: "#F3F4F6",
                            color: "#9CA3AF",
                            fontWeight: 600,
                            border: "1px solid rgba(0,0,0,0.07)",
                          }
                    }
                  >
                    {isPurchased ? "구매 완료" : canAfford ? "교환하기" : "포인트 부족"}
                    {canAfford && !isPurchased && <ChevronRight size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="px-4 pb-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div
          className="rounded-xl p-3 mt-3"
          style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)" }}
        >
          <p className="text-[11px] mb-1" style={{ color: "#7C3AED", fontWeight: 700 }}>
            💡 포인트 적립 방법
          </p>
          <p className="text-[10px]" style={{ color: "#6B7280", lineHeight: "1.5" }}>
            분실물 발견, 습득물 등록, 일일 출석 체크로 포인트를 모으세요!
          </p>
        </div>
      </div>
    </div>
  );
}
