import { useState } from "react";
import { X, Send, Loader } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface QuestReportModalProps {
  questId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuestReportModal({ questId, onClose, onSuccess }: QuestReportModalProps) {
  const { currentUser, userProfile } = useAuth();
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!location.trim() || !description.trim()) {
      toast.error("위치와 상세 내용을 모두 입력해주세요.");
      return;
    }
    
    if (!currentUser) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "quest_reports"), {
        questId,
        reporterUid: currentUser.uid,
        finderName: userProfile?.displayName ?? currentUser.displayName ?? "익명 헌터",
        location,
        description,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      toast.success("제보가 접수되었습니다!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("제보 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-[80]" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
      <div className="absolute z-[90] left-4 right-4" style={{ top: "50%", transform: "translateY(-50%)", background: "#ffffff", borderRadius: "20px", padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100"
        >
          <X size={16} className="text-gray-600" />
        </button>
        
        <h3 className="text-[18px] mb-4" style={{ fontWeight: 800, color: "#111827" }}>발견 제보하기</h3>
        
        <div className="mb-3">
          <label className="block text-[12px] font-bold text-gray-700 mb-1">발견 위치</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예) 안양역 1번 출구 앞"
            className="w-full p-3 rounded-xl text-[14px]"
            style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}
          />
        </div>

        <div className="mb-5">
          <label className="block text-[12px] font-bold text-gray-700 mb-1">상세 내용</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상세한 발견 정황이나 상태를 적어주세요."
            className="w-full p-3 rounded-xl text-[14px] h-24 resize-none"
            style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3.5 rounded-xl text-[14px] flex items-center justify-center gap-2"
          style={{ background: submitting ? "#E5E7EB" : "linear-gradient(135deg, #F59E0B, #D97706)", color: submitting ? "#9CA3AF" : "#1a1200", fontWeight: 800 }}
        >
          {submitting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
          {submitting ? "등록 중..." : "제보 등록"}
        </button>
      </div>
    </>
  );
}
