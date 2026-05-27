import { Camera, MapPin, Sparkles, CheckCircle2, Users, Percent, Navigation, Clock, MessageCircle, Coins } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { ChatRoomScreen } from "./ChatRoomScreen";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { createNotification } from "../../lib/notifications";
import { compressImage } from "../../lib/imageUtils";
import { LocationPickerModal } from "./LocationPickerModal";

const SIMILAR_ITEMS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1629958513881-a086d21383cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxibGFjayUyMGxlYXRoZXIlMjB3YWxsZXR8ZW58MXx8fHwxNzc1ODg3ODQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "검은색 가죽 지갑",
    location: "범계역 3번 출구",
    matchPercent: 94,
    searchersCount: 12,
    status: "보관중",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1602638034367-26c55969967c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxibGFjayUyMGxlYXRoZXIlMjB3YWxsZXR8ZW58MXx8fHwxNzc1ODg3ODQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "갈색 장지갑",
    location: "평촌 스타벅스",
    matchPercent: 87,
    searchersCount: 8,
    status: "보관중",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1620109433753-a62f2c961b69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxibGFjayUyMGxlYXRoZXIlMjB3YWxsZXR8ZW58MXx8fHwxNzc1ODg3ODQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "검정 반지갑",
    location: "인덕원역 1번 출구",
    matchPercent: 76,
    searchersCount: 5,
    status: "수령 대기",
  },
];

export function LostOwnerScreen({ onSuccess }: { onSuccess?: () => void }) {
  const { addQuest, spendPoints, userPoints } = useAppContext();
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itemName, setItemName] = useState("");
  const [location, setLocation] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [reward, setReward] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [urgentAlert, setUrgentAlert] = useState(false);
  const [pinToTop, setPinToTop] = useState(false);
  const [showChatRoom, setShowChatRoom] = useState(false);
  const [chatItem, setChatItem] = useState<(typeof SIMILAR_ITEMS)[0] | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const optionCost = (pinToTop ? 5000 : 0) + (urgentAlert ? 3000 : 0);

  const handleSubmit = async () => {
    if (!itemName || !location) {
      toast.error("물건 이름과 장소를 입력해주세요.");
      return;
    }
    if (optionCost > 0) {
      if (userPoints < optionCost) {
        toast.error(`포인트가 부족합니다. (필요: ${optionCost.toLocaleString()} P, 보유: ${userPoints.toLocaleString()} P)`);
        return;
      }
      const uid = currentUser?.uid ?? "";
      const ok = await spendPoints(uid, optionCost);
      if (!ok) {
        toast.error("포인트 차감에 실패했습니다. 다시 시도해주세요.");
        return;
      }
    }
    setSubmitting(true);
    try {
      let imageUrl = "https://images.unsplash.com/photo-1544816155-12df9643f363?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

      // M3: 업로드 전 이미지 압축 (1200px / WebP 85%)
      if (imageFile && currentUser) {
        const compressed = await compressImage(imageFile);
        const storageRef = ref(storage, `quests/${currentUser.uid}/${Date.now()}_${compressed.name}`);
        const snapshot = await uploadBytes(storageRef, compressed);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const rewardValue = reward.replace(/,/g, "").trim();
      const rewardFormatted = rewardValue
        ? Number(rewardValue).toLocaleString()
        : "50,000";

      await addQuest({
        title: itemName + " 분실",
        location,
        reward: rewardFormatted,
        image: imageUrl,
        isPremium: urgentAlert,
        category: "기타",
        uid: currentUser?.uid,
      });
      toast.success("분실물이 등록되었습니다! 🎉");
      if (onSuccess) onSuccess();
    } catch (e) {
      toast.error("등록에 실패했습니다. 다시 시도해주세요.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAI = () => {
    setImagePreview("https://images.unsplash.com/photo-1629958513881-a086d21383cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080");
  };

  if (showChatRoom && chatItem) {
    return (
      <ChatRoomScreen
        onBack={() => { setShowChatRoom(false); setChatItem(null); }}
        questId={`found-${chatItem.id}`}
        questItem={{
          image: chatItem.image,
          title: chatItem.name,
          location: chatItem.location,
          reward: "20,000",
          distance: "근처",
        }}
      />
    );
  }


  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none", background: "#ffffff" }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        <h1 className="text-[22px] mb-1" style={{ fontWeight: 900, letterSpacing: "-0.5px", color: "#111827" }}>
          분실물 등록
        </h1>
        <p className="text-[13px]" style={{ color: "#6B7280" }}>
          AI가 유사 습득물을 자동으로 매칭해드립니다
        </p>
      </div>

      {/* Registration Form */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl p-4" style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="mb-4">
            <label className="block text-[12px] mb-2" style={{ color: "#6B7280", fontWeight: 600 }}>
              물건 이름
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="예: 검은색 가죽 지갑"
              className="w-full px-4 py-3 rounded-xl text-[14px] placeholder-gray-400"
              style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", outline: "none", color: "#111827" }}
            />
          </div>

          <div className="mb-6">
            <label className="block text-[13px] mb-2 px-1" style={{ color: "#4B5563", fontWeight: 700 }}>
              분실 장소
            </label>
            <div
              onClick={() => setShowLocationPicker(true)}
              className="w-full px-4 py-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
              style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)" }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MapPin size={18} style={{ color: location ? "#10B981" : "#9CA3AF" }} />
                <span className="text-[14.5px] truncate" style={{ color: location ? "#111827" : "#9CA3AF" }}>
                  {location || "지도에서 분실 장소 선택"}
                </span>
              </div>
              <span className="text-[12px] font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                지도 열기
              </span>
            </div>
          </div>

          {/* 사진 업로드 */}
          <div className="mb-4">
            <label className="block text-[12px] mb-2" style={{ color: "#6B7280", fontWeight: 600 }}>
              사진 첨부 <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(선택)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {!imagePreview ? (
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 rounded-xl py-4 flex flex-col items-center justify-center gap-2"
                  style={{ background: "rgba(124,58,237,0.05)", border: "2px dashed rgba(124,58,237,0.25)" }}
                >
                  <Camera size={24} style={{ color: "#7C3AED" }} />
                  <span className="text-[12px]" style={{ color: "#7C3AED", fontWeight: 600 }}>갤러리에서 선택</span>
                </button>
                <button
                  onClick={handleGenerateAI}
                  className="flex-1 rounded-xl py-4 flex flex-col items-center justify-center gap-2"
                  style={{ background: "rgba(245,158,11,0.05)", border: "2px dashed rgba(245,158,11,0.25)" }}
                >
                  <Sparkles size={24} style={{ color: "#F59E0B" }} />
                  <span className="text-[12px]" style={{ color: "#F59E0B", fontWeight: 600 }}>AI 이미지 생성</span>
                </button>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid rgba(124,58,237,0.3)" }}>
                <img src={imagePreview} alt="preview" className="w-full h-40 object-cover" />
                <button
                  onClick={() => { setImagePreview(null); setImageFile(null); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-[14px]"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  ✕
                </button>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: "rgba(16,185,129,0.9)" }}>
                  <CheckCircle2 size={12} style={{ color: "white" }} />
                  <span className="text-[10px] text-white" style={{ fontWeight: 700 }}>사진 선택됨</span>
                </div>
              </div>
            )}
          </div>

          {/* 보상금 입력 */}
          <div className="mb-2">
            <label className="block text-[12px] mb-2" style={{ color: "#6B7280", fontWeight: 600 }}>
              보상금 <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(비워두면 50,000원)</span>
            </label>
            <div className="relative">
              <Coins size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
              <input
                type="number"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="예: 50000"
                className="w-full pl-10 pr-12 py-3 rounded-xl text-[14px] placeholder-gray-400"
                style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", outline: "none", color: "#111827" }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px]" style={{ color: "#9CA3AF" }}>원</span>
            </div>
          </div>


          {/* Premium Options */}
          <div className="space-y-2">
            <div
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
              style={{ background: pinToTop ? "rgba(245,158,11,0.08)" : "#ffffff", border: "1px solid " + (pinToTop ? "rgba(245,158,11,0.35)" : "rgba(0,0,0,0.08)") }}
              onClick={() => setPinToTop(!pinToTop)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: pinToTop ? "#F59E0B" : "#F3F4F6", border: "1px solid " + (pinToTop ? "#F59E0B" : "rgba(0,0,0,0.12)") }}
                >
                  {pinToTop && <CheckCircle2 size={14} style={{ color: "#1a1200" }} />}
                </div>
                <span className="text-[13px]" style={{ fontWeight: 600, color: "#111827" }}>상단 노출 고정</span>
              </div>
              <span className="text-[12px]" style={{ color: "#F59E0B", fontWeight: 700 }}>+5,000 P</span>
            </div>

            <div
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
              style={{ background: urgentAlert ? "rgba(245,158,11,0.08)" : "#ffffff", border: "1px solid " + (urgentAlert ? "rgba(245,158,11,0.35)" : "rgba(0,0,0,0.08)") }}
              onClick={() => setUrgentAlert(!urgentAlert)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: urgentAlert ? "#F59E0B" : "#F3F4F6", border: "1px solid " + (urgentAlert ? "#F59E0B" : "rgba(0,0,0,0.12)") }}
                >
                  {urgentAlert && <CheckCircle2 size={14} style={{ color: "#1a1200" }} />}
                </div>
                <span className="text-[13px]" style={{ fontWeight: 600, color: "#111827" }}>긴급 알림 전송</span>
              </div>
              <span className="text-[12px]" style={{ color: "#F59E0B", fontWeight: 700 }}>+3,000 P</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full mt-6 px-4 py-3.5 rounded-xl text-[15px]"
            style={{ background: submitting ? "#9CA3AF" : "linear-gradient(135deg, #10B981, #059669)", color: "#ffffff", fontWeight: 800, boxShadow: submitting ? "none" : "0 4px 14px rgba(16,185,129,0.3)" }}
          >
            {submitting ? "등록 중..." : `분실물 등록하기${optionCost > 0 ? ` (-${optionCost.toLocaleString()} P)` : ""}`}
          </button>
        </div>
      </div>

      {/* Similar Found Items Section */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #F59E0B, #D97706)" }} />
          <span className="text-[14px]" style={{ fontWeight: 700, color: "#111827" }}>유사 습득물 매칭</span>
          <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED", fontWeight: 700 }}>
            {SIMILAR_ITEMS.length}개
          </span>
        </div>

        <div className="space-y-3">
          {SIMILAR_ITEMS.map((item) => {
            const isSelected = selectedItemId === item.id;

            return (
              <div key={item.id}>
                <div
                  onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                  className="rounded-xl p-3 flex gap-3 cursor-pointer"
                  style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.12)" }}>
                        <Percent size={10} style={{ color: "#F59E0B" }} />
                        <span className="text-[11px]" style={{ color: "#F59E0B", fontWeight: 800 }}>
                          {item.matchPercent}% 일치
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={10} style={{ color: "#9CA3AF" }} />
                        <span className="text-[10px]" style={{ color: "#9CA3AF" }}>
                          {item.searchersCount}명 찾는 중
                        </span>
                      </div>
                    </div>

                    <p className="text-[13px] mb-1" style={{ fontWeight: 600, color: "#111827" }}>
                      {item.name}
                    </p>

                    <div className="flex items-center gap-1.5">
                      <MapPin size={10} style={{ color: "#9CA3AF" }} />
                      <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{item.location}</span>
                      <span style={{ color: "#D1D5DB", fontSize: "8px" }}>•</span>
                      <span className="text-[11px]" style={{ color: item.status === "보관중" ? "#10B981" : "#F59E0B", fontWeight: 600 }}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <button
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] self-start"
                    style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#1a1200", fontWeight: 800 }}
                  >
                    확인
                  </button>
                </div>

                {/* Expanded Actions */}
                {isSelected && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setChatItem(item); setShowChatRoom(true); }}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px]"
                      style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", fontWeight: 700, border: "1px solid rgba(124,58,237,0.25)" }}
                    >
                      <MessageCircle size={16} />
                      익명 채팅 참여
                    </button>

                    <button
                      onClick={() => window.open(`https://map.kakao.com/link/search/${encodeURIComponent(item.location)}`, "_blank")}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px]"
                      style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#1a1200", fontWeight: 800 }}
                    >
                      <Navigation size={16} />
                      위치 안내
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pickup Information */}
      <div className="px-4 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #7C3AED, #6D28D9)" }} />
          <span className="text-[14px]" style={{ fontWeight: 700, color: "#111827" }}>기관 위치 및 수령 방법</span>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="h-32 relative" style={{ background: "rgba(124,58,237,0.06)" }}>
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800"
              alt="Map"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <Navigation size={16} style={{ color: "#7C3AED" }} />
                <span className="text-[12px]" style={{ fontWeight: 600, color: "#111827" }}>안양시 분실물센터</span>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5" style={{ color: "#9CA3AF" }} />
              <div>
                <p className="text-[12px]" style={{ fontWeight: 600, color: "#111827" }}>안양시청 1층 민원실</p>
                <p className="text-[11px]" style={{ color: "#9CA3AF" }}>경기도 안양시 만안구 안양로 123</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock size={14} className="mt-0.5" style={{ color: "#9CA3AF" }} />
              <div>
                <p className="text-[12px]" style={{ fontWeight: 600, color: "#111827" }}>운영 시간</p>
                <p className="text-[11px]" style={{ color: "#9CA3AF" }}>평일 09:00 - 18:00 (점심시간 12:00-13:00)</p>
              </div>
            </div>

            <button
              onClick={() => window.open(`https://map.kakao.com/link/search/${encodeURIComponent("안양시청 1층 민원실")}`, "_blank")}
              className="w-full mt-3 px-4 py-3 rounded-lg text-[13px] flex items-center justify-center gap-2"
              style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", fontWeight: 700, border: "1px solid rgba(124,58,237,0.25)" }}
            >
              <Navigation size={16} />
              길찾기
            </button>
          </div>
        </div>
      </div>

      <div className="h-20" />
      {/* 지도 위치 선택 모달 */}
      {showLocationPicker && (
        <LocationPickerModal
          onClose={() => setShowLocationPicker(false)}
          onSelect={(selectedLoc) => {
            setLocation(selectedLoc);
            setShowLocationPicker(false);
          }}
        />
      )}
    </div>
  );
}
