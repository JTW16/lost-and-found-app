import { useState } from "react";
import { Camera, CheckCircle2, X } from "lucide-react";

interface QuestReportModalProps {
  questId: string;
  onClose: () => void;
}

export function QuestReportModal({ questId, onClose }: QuestReportModalProps) {
  const [reportStep, setReportStep] = useState<"form" | "success">("form");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // 가짜 딜레이
    setTimeout(() => {
      setIsSubmitting(false);
      setReportStep("success");
    }, 1500);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      >
        <div
          className="w-full max-w-sm rounded-3xl overflow-hidden relative flex flex-col"
          style={{ background: "#ffffff", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
        >
          {reportStep === "form" ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className="text-[18px]" style={{ fontWeight: 800, color: "#111827" }}>
                  발견 제보하기
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "#F3F4F6" }}
                >
                  <X size={16} style={{ color: "#6B7280" }} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 pb-6">
                <p className="text-[13px] mb-4" style={{ color: "#6B7280" }}>
                  주변에서 발견한 분실물의 사진과 위치 정보를 제보해주세요.
                </p>

                <div className="mb-4">
                  <label className="block text-[12px] mb-2" style={{ color: "#6B7280", fontWeight: 600 }}>
                    현장 사진 (필수)
                  </label>
                  {!photoPreview ? (
                    <button
                      onClick={() => setPhotoPreview("https://images.unsplash.com/photo-1544816155-12df9643f363?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400")}
                      className="w-full h-32 rounded-xl flex flex-col items-center justify-center gap-2"
                      style={{ background: "rgba(245,158,11,0.05)", border: "2px dashed rgba(245,158,11,0.25)" }}
                    >
                      <Camera size={24} style={{ color: "#F59E0B" }} />
                      <span className="text-[12px]" style={{ color: "#F59E0B", fontWeight: 600 }}>사진 촬영하기</span>
                    </button>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden h-32" style={{ border: "1px solid rgba(245,158,11,0.3)" }}>
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setPhotoPreview(null)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-[14px]"
                        style={{ background: "rgba(0,0,0,0.5)" }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-[12px] mb-2" style={{ color: "#6B7280", fontWeight: 600 }}>
                    상세 설명
                  </label>
                  <textarea
                    placeholder="발견한 정확한 위치나 상태를 설명해주세요 (예: GS25 편의점 앞 벤치 위)"
                    className="w-full p-3 rounded-xl text-[13px] placeholder-gray-400 resize-none h-24"
                    style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.1)", outline: "none", color: "#111827" }}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!photoPreview || isSubmitting}
                  className="w-full py-3.5 rounded-xl text-[15px]"
                  style={{
                    background: photoPreview && !isSubmitting ? "linear-gradient(135deg, #F59E0B, #D97706)" : "#E5E7EB",
                    color: photoPreview && !isSubmitting ? "#1a1200" : "#9CA3AF",
                    fontWeight: 800,
                    boxShadow: photoPreview && !isSubmitting ? "0 4px 14px rgba(245,158,11,0.3)" : "none",
                  }}
                >
                  {isSubmitting ? "전송 중..." : "제보 완료하기"}
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(16,185,129,0.1)" }}>
                <CheckCircle2 size={32} style={{ color: "#10B981" }} />
              </div>
              <h3 className="text-[20px] mb-2" style={{ fontWeight: 800, color: "#111827" }}>
                제보가 접수되었습니다!
              </h3>
              <p className="text-[13px] mb-6" style={{ color: "#6B7280" }}>
                주인이 확인 후 보상금을 지급할 예정입니다.<br />
                참여해주셔서 감사합니다.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl text-[15px]"
                style={{ background: "#F3F4F6", color: "#374151", fontWeight: 700 }}
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
