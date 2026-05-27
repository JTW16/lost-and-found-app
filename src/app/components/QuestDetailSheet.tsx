import { X, MapPin, Coins, MessageCircle, Flag, CheckCircle2, Clock, User, Send, ChevronRight, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { QuestReportModal } from "./QuestReportModal";
import { Quest, useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, where } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "sonner";

interface QuestReport {
  id: string;
  reporterUid: string;
  description: string;
  location: string;
  status: string;
  createdAt?: { toDate: () => Date };
  finderName?: string;
}

interface QuestDetailSheetProps {
  quest: Quest;
  onClose: () => void;
  onChat: (questId: string) => void;
}

export function QuestDetailSheet({ quest, onClose, onChat }: QuestDetailSheetProps) {
  const { completeQuest } = useAppContext();
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<QuestReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [completingWith, setCompletingWith] = useState<string | null>(null); // 완료 처리 중인 report id
  const [showCompleteConfirm, setShowCompleteConfirm] = useState<QuestReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [completing, setCompleting] = useState(false);

  const isOwner = currentUser?.uid === quest.uid;
  const rewardAmount = parseInt(quest.reward.replace(/,/g, "")) || 0;

  // quest_reports 실시간 구독
  useEffect(() => {
    const q = query(
      collection(db, "quest_reports"),
      where("questId", "==", quest.id),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setReports(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<QuestReport, "id">),
        }))
      );
      setLoadingReports(false);
    }, () => setLoadingReports(false));
    return () => unsub();
  }, [quest.id]);

  // 퀘스트 완료 처리 (보상 포인트 헌터에게 지급)
  const handleComplete = async (report: QuestReport) => {
    if (!isOwner) return;
    setCompleting(true);
    try {
      await completeQuest(quest.id, report.reporterUid, rewardAmount);
      toast.success(`✅ 완료! ${rewardAmount.toLocaleString()}P가 헌터에게 지급되었습니다.`);
      onClose();
    } catch (e) {
      toast.error("완료 처리에 실패했습니다.");
      console.error(e);
    } finally {
      setCompleting(false);
      setShowCompleteConfirm(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{ background: "#ffffff", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)", maxHeight: "90%" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "#E5E7EB" }} />
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "80vh", scrollbarWidth: "none" }}>
          {/* Hero Image */}
          <div className="relative" style={{ height: "200px" }}>
            <img src={quest.image} alt={quest.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />
            {quest.isPremium && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px]" style={{ background: "rgba(245,158,11,0.9)", color: "#1a1200", fontWeight: 800, backdropFilter: "blur(4px)" }}>
                ⭐ PREMIUM S.O.S
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            >
              <X size={16} style={{ color: "#ffffff" }} />
            </button>
            <div className="absolute bottom-3 left-4">
              <span className="text-[22px]" style={{ fontWeight: 900, color: "#F59E0B", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                💰 {quest.reward} KRW
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pt-4">
            {/* Category + Status */}
            <div className="flex items-center gap-2 mb-2">
              {quest.category && (
                <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED", fontWeight: 700 }}>
                  {quest.category}
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", fontWeight: 700 }}>
                🟢 {quest.status === "open" ? "접수중" : "완료"}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-[20px] mb-2" style={{ fontWeight: 800, letterSpacing: "-0.5px", color: "#111827" }}>
              {quest.title}
            </h2>

            {/* Location + Distance */}
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} style={{ color: "#9CA3AF" }} />
              <span className="text-[13px]" style={{ color: "#6B7280" }}>{quest.location}</span>
              <span style={{ color: "#D1D5DB" }}>•</span>
              <span className="text-[13px]" style={{ color: "#10B981", fontWeight: 600 }}>{quest.distance}</span>
            </div>

            {/* Description */}
            {quest.description && (
              <div className="mb-4 p-3 rounded-xl" style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.07)" }}>
                <p className="text-[13px]" style={{ color: "#374151", lineHeight: "1.6" }}>{quest.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            {quest.status !== "completed" && (
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button
                  onClick={() => onChat(quest.id)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px]"
                  style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", fontWeight: 700, border: "1px solid rgba(124,58,237,0.25)" }}
                >
                  <MessageCircle size={16} />
                  익명 채팅
                </button>
                <button
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px]"
                  style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#1a1200", fontWeight: 800 }}
                  onClick={() => setShowReportModal(true)}
                >
                  <Flag size={16} />
                  발견 제보
                </button>
              </div>
            )}

            {/* Reports Section */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #F59E0B, #D97706)" }} />
                <span className="text-[14px]" style={{ fontWeight: 700, color: "#111827" }}>제보 현황</span>
                <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED", fontWeight: 700 }}>
                  {reports.length}건
                </span>
              </div>

              {loadingReports ? (
                <div className="py-6 flex justify-center">
                  <Loader size={20} style={{ color: "#9CA3AF" }} className="animate-spin" />
                </div>
              ) : reports.length === 0 ? (
                <div className="py-6 flex flex-col items-center gap-1.5" style={{ background: "#F9FAFB", borderRadius: "12px" }}>
                  <span className="text-[24px]">📭</span>
                  <p className="text-[12px]" style={{ color: "#9CA3AF" }}>아직 제보가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.map((report) => (
                    <div key={report.id} className="p-3 rounded-xl" style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.07)" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <User size={11} style={{ color: "#9CA3AF" }} />
                            <span className="text-[11px]" style={{ color: "#9CA3AF" }}>
                              {report.finderName ?? "익명 헌터"}
                            </span>
                            <span style={{ color: "#E5E7EB", fontSize: "10px" }}>•</span>
                            <MapPin size={10} style={{ color: "#9CA3AF" }} />
                            <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{report.location}</span>
                          </div>
                          <p className="text-[13px]" style={{ color: "#374151", lineHeight: "1.4" }}>{report.description}</p>
                        </div>

                        {/* 퀘스트 소유자에게만 완료 처리 버튼 표시 */}
                        {isOwner && quest.status !== "completed" && (
                          <button
                            onClick={() => setShowCompleteConfirm(report)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1"
                            style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "#ffffff", fontWeight: 700 }}
                          >
                            <CheckCircle2 size={12} />
                            완료
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 완료 확인 모달 */}
      {showCompleteConfirm && (
        <>
          <div className="absolute inset-0 z-[60]" style={{ background: "rgba(0,0,0,0.6)" }} />
          <div className="absolute z-[70] left-4 right-4" style={{ top: "50%", transform: "translateY(-50%)", background: "#ffffff", borderRadius: "20px", padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="text-center mb-4">
              <span className="text-[40px]">🎉</span>
              <h3 className="text-[17px] mt-2" style={{ fontWeight: 800, color: "#111827" }}>분실물을 찾으셨나요?</h3>
              <p className="text-[13px] mt-1" style={{ color: "#6B7280", lineHeight: "1.5" }}>
                이 제보를 채택하면 헌터에게<br />
                <span style={{ color: "#F59E0B", fontWeight: 800 }}>{rewardAmount.toLocaleString()} 포인트</span>가 즉시 지급됩니다.
              </p>
            </div>
            <div className="p-3 rounded-xl mb-4" style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.07)" }}>
              <p className="text-[12px]" style={{ color: "#374151" }}>📍 {showCompleteConfirm.location}</p>
              <p className="text-[12px] mt-1" style={{ color: "#374151" }}>💬 {showCompleteConfirm.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowCompleteConfirm(null)}
                className="py-3 rounded-xl text-[14px]"
                style={{ background: "#F3F4F6", color: "#6B7280", fontWeight: 600 }}
              >
                취소
              </button>
              <button
                onClick={() => handleComplete(showCompleteConfirm)}
                disabled={completing}
                className="py-3 rounded-xl text-[14px] flex items-center justify-center gap-2"
                style={{ background: completing ? "#F3F4F6" : "linear-gradient(135deg, #10B981, #059669)", color: completing ? "#9CA3AF" : "#ffffff", fontWeight: 800 }}
              >
                {completing ? <Loader size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {completing ? "처리중..." : "완료 확정"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* 발견 제보 모달 */}
      {showReportModal && (
        <QuestReportModal
          questId={quest.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
}
