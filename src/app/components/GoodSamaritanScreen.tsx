import { Camera, MapPin, Clock, Store, Navigation, QrCode, Gift, CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { createNotification } from "../../lib/notifications";

const NEARBY_STORAGE = [
  {
    id: 1,
    name: "GS25 안양역점",
    type: "편의점",
    distance: "120m",
    address: "안양시 만안구 안양로 50",
    available: true,
  },
  {
    id: 2,
    name: "스타벅스 범계역점",
    type: "카페",
    distance: "280m",
    address: "안양시 동안구 시민대로 210",
    available: true,
  },
  {
    id: 3,
    name: "CU 평촌중앙점",
    type: "편의점",
    distance: "450m",
    address: "안양시 동안구 평촌대로 101",
    available: true,
  },
  {
    id: 4,
    name: "이디야커피 인덕원점",
    type: "카페",
    distance: "620m",
    address: "안양시 동안구 흥안대로 85",
    available: false,
  },
];

export function GoodSamaritanScreen() {
  const { currentUser, userProfile } = useAuth();
  const { setUserPoints, userPoints } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [itemName, setItemName] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStorageId, setSelectedStorageId] = useState<number | null>(null);
  const [authCode, setAuthCode] = useState<string>("");

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleGenerateQR = async () => {
    if (!location) {
      toast.error("습득 장소를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = "https://images.unsplash.com/photo-1629958513881-a086d21383cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

      // 이미지 Firebase Storage 업로드
      if (photoFile && currentUser) {
        const storageRef = ref(storage, `found/${currentUser.uid}/${Date.now()}_${photoFile.name}`);
        const snapshot = await uploadBytes(storageRef, photoFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const docRef = await addDoc(collection(db, "found_items"), {
        title: (itemName || "습득물") + " 습득",
        location,
        time: time || "현재",
        image: imageUrl,
        uid: currentUser?.uid,
        finderName: userProfile?.displayName ?? "익명",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Firestore doc ID 기반 동적 인증코드 생성
      const rawId = docRef.id;
      const code = `FI-${rawId.slice(0, 4).toUpperCase()}-${rawId.slice(4, 8).toUpperCase()}`;
      setAuthCode(code);

      // 포인트 지급 — 로컬 상태 즉시 반영 + Firestore 동기화
      const earned = 5000;
      setUserPoints(userPoints + earned);
      if (currentUser) {
        try {
          await updateDoc(doc(db, "users", currentUser.uid), {
            points: increment(earned),
          });
          // #8: 포인트 지급 알림
          await createNotification(currentUser.uid, {
            type: "reward",
            title: "포인트 지급 완료! 🎉",
            description: `습득물 등록 보상 +${earned.toLocaleString()} 포인트가 지급되었습니다.`,
            read: false,
          });
        } catch (e) {
          console.error("포인트 Firestore 업데이트 실패:", e);
        }
      }

      setQrGenerated(true);
      setTimeout(() => setPointsEarned(true), 1500);
    } catch (e) {
      toast.error("등록에 실패했습니다. 다시 시도해주세요.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none", background: "#ffffff" }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-[22px] mb-1" style={{ fontWeight: 900, letterSpacing: "-0.5px", color: "#111827" }}>
          습득물 등록
        </h1>
        <p className="text-[13px]" style={{ color: "#6B7280" }}>
          주운 물건을 등록하고 포인트를 받으세요
        </p>
      </div>

      {/* Reward Notice Banner */}
      {!pointsEarned ? (
        <div className="mx-4 mb-4 rounded-xl p-4" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.06))", border: "1px solid rgba(245,158,11,0.3)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.15)" }}>
              <Gift size={20} style={{ color: "#F59E0B" }} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] mb-0.5" style={{ fontWeight: 700, color: "#111827" }}>즉시 포인트 지급!</p>
              <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
                물건을 맡기면 즉시 <span style={{ color: "#F59E0B", fontWeight: 700 }}>5,000 포인트</span>가 지급됩니다
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-4 mb-4 rounded-xl p-4" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.06))", border: "1px solid rgba(16,185,129,0.3)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.15)" }}>
              <CheckCircle2 size={20} style={{ color: "#10B981" }} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] mb-0.5" style={{ color: "#10B981", fontWeight: 700 }}>포인트 지급 완료!</p>
              <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
                <span style={{ color: "#10B981", fontWeight: 700 }}>+5,000 포인트</span>가 지급되었습니다
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl p-4" style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}>
          <label className="block text-[12px] mb-3" style={{ color: "#6B7280", fontWeight: 600 }}>
            습득물 이름 & 사진
          </label>

          {/* 물건 이름 */}
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="예: 검은색 가죽 지갑"
            className="w-full px-4 py-3 rounded-xl text-[14px] placeholder-gray-400 mb-3"
            style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", outline: "none", color: "#111827" }}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          {!photoPreview ? (
            <button
              onClick={handleTakePhoto}
              className="w-full rounded-xl p-8 flex flex-col items-center justify-center"
              style={{ background: "rgba(124,58,237,0.05)", border: "2px dashed rgba(124,58,237,0.25)" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}
              >
                <Camera size={24} style={{ color: "white" }} />
              </div>
              <span className="text-[14px] mb-1" style={{ fontWeight: 700, color: "#111827" }}>사진 선택하기</span>
              <span className="text-[11px]" style={{ color: "#9CA3AF" }}>갤러리에서 선택</span>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid rgba(124,58,237,0.3)" }}>
              <img src={photoPreview} alt="Found item" className="w-full h-48 object-cover" />
              <button
                onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-[14px]"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                ✕
              </button>
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: "rgba(16,185,129,0.9)" }}>
                <CheckCircle2 size={12} style={{ color: "white" }} />
                <span className="text-[10px] text-white" style={{ fontWeight: 700 }}>사진 등록됨</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location and Time */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl p-4" style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="mb-4">
            <label className="block text-[12px] mb-2" style={{ color: "#6B7280", fontWeight: 600 }}>
              습득 장소
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 안양역 2번 출구"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] placeholder-gray-400"
                style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", outline: "none", color: "#111827" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] mb-2" style={{ color: "#6B7280", fontWeight: 600 }}>
              습득 시간
            </label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="예: 오늘 오후 2시 30분"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] placeholder-gray-400"
                style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", outline: "none", color: "#111827" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Partner Storage Locations */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #7C3AED, #6D28D9)" }} />
          <span className="text-[14px]" style={{ fontWeight: 700, color: "#111827" }}>제휴 무인 보관소</span>
        </div>

        <div className="space-y-2">
          {NEARBY_STORAGE.map((s) => {
            const isSelected = selectedStorageId === s.id;
            return (
              <div key={s.id}>
                <button
                  disabled={!s.available}
                  onClick={() => {
                    if (!s.available) return;
                    setSelectedStorageId(isSelected ? null : s.id);
                    if (!isSelected) toast.success(`${s.name} 보관소가 선택되었습니다`);
                  }}
                  className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all"
                  style={{
                    background: isSelected ? "rgba(124,58,237,0.07)" : s.available ? "#F9FAFB" : "#F3F4F6",
                    border: isSelected ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(0,0,0,0.08)",
                    opacity: s.available ? 1 : 0.5,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: s.available ? "rgba(124,58,237,0.1)" : "rgba(0,0,0,0.05)" }}
                  >
                    <Store size={18} style={{ color: s.available ? "#7C3AED" : "#9CA3AF" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px]" style={{ fontWeight: 600, color: "#111827" }}>{s.name}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED", fontWeight: 700 }}
                      >
                        {s.type}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", fontWeight: 700 }}>
                          선택됨
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] mb-1" style={{ color: "#9CA3AF" }}>{s.address}</p>
                    <div className="flex items-center gap-1">
                      <Navigation size={10} style={{ color: "#10B981" }} />
                      <span className="text-[11px]" style={{ color: "#10B981", fontWeight: 600 }}>{s.distance}</span>
                    </div>
                  </div>

                  {s.available ? (
                    <ChevronRight size={18} style={{ color: isSelected ? "#7C3AED" : "#9CA3AF" }} />
                  ) : (
                    <span className="text-[10px] px-2 py-1 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", fontWeight: 600 }}>
                      만석
                    </span>
                  )}
                </button>

                {/* 선택된 보관소 — 길찾기 버튼 */}
                {isSelected && (
                  <button
                    onClick={() => window.open(`https://map.kakao.com/link/search/${encodeURIComponent(s.name)}`, "_blank")}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-[12px] flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "#ffffff", fontWeight: 700, boxShadow: "0 4px 12px rgba(124,58,237,0.25)" }}
                  >
                    <Navigation size={14} />
                    길찾기
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Generation */}
      <div className="px-4 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #F59E0B, #D97706)" }} />
          <span className="text-[14px]" style={{ fontWeight: 700, color: "#111827" }}>보관소 키오스크 연동</span>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}>
          {!qrGenerated ? (
            <div className="p-8 flex flex-col items-center">
              <div className="w-32 h-32 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(245,158,11,0.06)", border: "2px dashed rgba(245,158,11,0.3)" }}>
                <QrCode size={48} style={{ color: "#F59E0B" }} />
              </div>
              <p className="text-[12px] text-center mb-4" style={{ color: "#9CA3AF" }}>
                등록하면 5,000 포인트가 즉시 지급됩니다
              </p>
              <button
                onClick={handleGenerateQR}
                disabled={submitting}
                className="px-6 py-3 rounded-lg text-[13px] flex items-center gap-2"
                style={{
                  background: submitting ? "#F3F4F6" : "linear-gradient(135deg, #F59E0B, #D97706)",
                  color: submitting ? "#9CA3AF" : "#1a1200",
                  fontWeight: 800,
                }}
              >
                <QrCode size={16} />
                {submitting ? "등록 중..." : "습득물 등록하기"}
              </button>
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-40 h-40 rounded-2xl flex items-center justify-center" style={{ background: "white", padding: "12px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                  <div className="w-full h-full" style={{ background: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23000%22/%3E%3Crect x=%2210%22 y=%2210%22 width=%2215%22 height=%2215%22 fill=%22%23fff%22/%3E%3Crect x=%2275%22 y=%2210%22 width=%2215%22 height=%2215%22 fill=%22%23fff%22/%3E%3Crect x=%2210%22 y=%2275%22 width=%2215%22 height=%2215%22 fill=%22%23fff%22/%3E%3C/svg%3E')", backgroundSize: "cover" }} />
                </div>
                {pointsEarned && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#10B981", boxShadow: "0 4px 12px rgba(16,185,129,0.4)" }}>
                      <CheckCircle2 size={18} style={{ color: "white" }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center mb-4">
                <p className="text-[13px] mb-1" style={{ fontWeight: 700, color: "#111827" }}>QR 코드 생성 완료</p>
                <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
                  보관소 키오스크에 스캔하세요
                </p>
              </div>

              <div className="w-full px-4 py-3 rounded-lg text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <p className="text-[11px] mb-1" style={{ color: "#9CA3AF" }}>인증 코드</p>
                <p className="text-[18px]" style={{ color: "#F59E0B", fontWeight: 900, letterSpacing: "0.1em" }}>
                  {authCode}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 pb-6">
        <div
          className="rounded-xl p-4"
          style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)" }}
        >
          <p className="text-[12px] mb-2" style={{ color: "#7C3AED", fontWeight: 700 }}>💡 이용 안내</p>
          <ol className="text-[11px] space-y-1" style={{ color: "#6B7280", lineHeight: "1.5", paddingLeft: "16px" }}>
            <li>1. 가까운 제휴 보관소를 선택하세요</li>
            <li>2. QR 코드를 생성하고 키오스크에 스캔하세요</li>
            <li>3. 안내에 따라 물건을 보관함에 넣으세요</li>
            <li>4. 보관 완료 시 즉시 포인트가 지급됩니다!</li>
          </ol>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}
