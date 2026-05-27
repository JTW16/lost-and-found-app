import { useState } from "react";
import { X, Save, Loader } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "sonner";
import { Quest } from "../context/AppContext";

interface EditQuestModalProps {
  quest: Quest;
  onClose: () => void;
}

export function EditQuestModal({ quest, onClose }: EditQuestModalProps) {
  const [title, setTitle] = useState(quest.title.replace(" 분실", ""));
  const [reward, setReward] = useState(quest.reward.replace(/,/g, ""));
  const [location, setLocation] = useState(quest.location);
  const [description, setDescription] = useState(quest.description || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !reward.trim() || !location.trim()) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const rewardValue = parseInt(reward, 10) || 0;
      const rewardFormatted = rewardValue.toLocaleString();
      const rewardShort = rewardValue > 0 ? `${Math.floor(rewardValue / 1000)}k` : "0k";

      await updateDoc(doc(db, "quests", quest.id), {
        title: title + " 분실",
        reward: rewardFormatted,
        rewardShort,
        location,
        description,
      });

      toast.success("퀘스트가 수정되었습니다!");
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-[100]" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
      <div className="absolute z-[110] left-4 right-4" style={{ top: "50%", transform: "translateY(-50%)", background: "#ffffff", borderRadius: "20px", padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px]" style={{ fontWeight: 800, color: "#111827" }}>퀘스트 수정</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
            <X size={16} className="text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1">분실물 이름</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl text-[14px]"
              style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1">보상금 (원)</label>
            <input
              type="number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="w-full p-3 rounded-xl text-[14px]"
              style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1">분실 장소</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 rounded-xl text-[14px]"
              style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1">상세 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl text-[14px] h-20 resize-none"
              style={{ background: "#F9FAFB", border: "1px solid rgba(0,0,0,0.08)" }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-xl text-[14px] flex items-center justify-center gap-2"
          style={{ background: saving ? "#E5E7EB" : "linear-gradient(135deg, #10B981, #059669)", color: saving ? "#9CA3AF" : "#ffffff", fontWeight: 800 }}
        >
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "저장 중..." : "수정 완료"}
        </button>
      </div>
    </>
  );
}
