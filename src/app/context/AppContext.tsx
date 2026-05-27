import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  runTransaction,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "./AuthContext";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Quest {
  id: string;
  image: string;
  reward: string;
  rewardShort: string;
  title: string;
  location: string;
  distance: string;
  isNew: boolean;
  category?: string;
  timeLeft?: string;
  isPremium?: boolean;
  createdAt?: unknown;
  uid?: string;
  lat?: number;
  lng?: number;
  status?: "open" | "completed" | "closed";
  description?: string;
}

export interface ChatMessage {
  id: string;
  type: "system" | "user" | "me";
  username?: string;
  content: string;
  timestamp: string;
  createdAt?: unknown;
}

interface AppContextType {
  quests: Quest[];
  premiumQuest: Quest | null;
  userPoints: number;
  unreadCount: number;
  loadingQuests: boolean;
  addQuest: (quest: Omit<Quest, "id" | "rewardShort" | "isNew" | "distance" | "createdAt">) => Promise<void>;
  spendPoints: (uid: string, amount: number) => Promise<boolean>;
  completeQuest: (questId: string, hunterUid: string, rewardAmount: number) => Promise<void>;
  chatMessages: ChatMessage[];
  sendMessage: (chatId: string, text: string, username: string) => Promise<void>;
  setUserPoints: (points: number) => void;
  updateQuest: (questId: string, data: Partial<Quest>) => Promise<void>;
  deleteQuest: (questId: string) => Promise<void>;
}

// ─── Demo fallback data (보여주기용, Firestore에 데이터 없을 때) ─────────────

const DEMO_PREMIUM: Quest = {
  id: "demo-premium",
  image: "https://images.unsplash.com/photo-1524226750215-b424f7377a80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  reward: "100,000",
  rewardShort: "100k",
  title: "맥북 프로 16인치 실버 분실",
  location: "안양역",
  distance: "300m",
  timeLeft: "02:14:33",
  category: "전자기기",
  isPremium: true,
  isNew: true,
  status: "open",
};

const DEMO_QUESTS: Quest[] = [
  { id: "demo-1", image: "https://images.unsplash.com/photo-1646848842285-d4c14f43781e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", reward: "20,000", rewardShort: "20k", title: "검은 가죽 지갑 분실", location: "범계역", distance: "650m", isNew: true, status: "open" },
  { id: "demo-2", image: "https://images.unsplash.com/photo-1773093758897-0becd0af36b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", reward: "30,000", rewardShort: "30k", title: "따릉이 번호판 & 자물쇠 분실", location: "평촌중앙공원", distance: "1.2km", isNew: false, status: "open" },
  { id: "demo-3", image: "https://images.unsplash.com/photo-1768081529866-a5ec754fe14c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", reward: "50,000", rewardShort: "50k", title: "소니 FE 24-70mm 렌즈 분실", location: "인덕원역 근처", distance: "2.1km", isNew: true, status: "open" },
  { id: "demo-4", image: "https://images.unsplash.com/photo-1550894832-407b1aa5a3af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", reward: "80,000", rewardShort: "80k", title: "포메라니안 '호두' 실종 (흰색·수컷)", location: "학의동 일원", distance: "3.4km", isNew: false, status: "open" },
];

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [quests, setQuests] = useState<Quest[]>(DEMO_QUESTS);
  const [premiumQuest, setPremiumQuest] = useState<Quest | null>(DEMO_PREMIUM);
  const [userPoints, setUserPoints] = useState<number>(10000);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Firestore: quests 컬렉션 실시간 구독 (open 상태만) ──
  useEffect(() => {
    const q = query(
      collection(db, "quests"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let allQuests: Quest[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Quest, "id">),
      }));

      // 클라이언트 측 필터링 (복합 인덱스 오류 방지)
      allQuests = allQuests.filter(q => q.status === "open" || !q.status);

      const premium = allQuests.find((q) => q.isPremium) ?? null;
      const regular = allQuests.filter((q) => !q.isPremium);

      if (allQuests.length > 0) {
        setPremiumQuest(premium);
        setQuests(regular);
      }
      setLoadingQuests(false);
    }, (error) => {
      console.error("Firestore 구독 오류:", error);
      setLoadingQuests(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Firestore: 읽지 않은 알림 카운트 구독 ──
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }
    const q = query(
      collection(db, "users", currentUser.uid, "notifications"),
      where("read", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    }, () => setUnreadCount(0));
    return () => unsub();
  }, [currentUser]);

  // ── Firestore: 퀘스트(분실물) 등록 ──
  const addQuest = async (newQuestData: Omit<Quest, "id" | "rewardShort" | "isNew" | "distance" | "createdAt">) => {
    const parsedReward = parseInt(newQuestData.reward.replace(/,/g, ""), 10) || 0;
    const rewardShort = parsedReward > 0 ? `${Math.floor(parsedReward / 1000)}k` : "0k";

    const docData = {
      ...newQuestData,
      rewardShort,
      distance: "0m",
      isNew: true,
      status: "open",
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "quests"), docData);
  };

  // ── Firestore: 퀘스트(분실물) 수정 ──
  const updateQuest = async (questId: string, data: Partial<Quest>) => {
    await updateDoc(doc(db, "quests", questId), data);
  };

  // ── Firestore: 퀘스트(분실물) 삭제 ──
  const deleteQuest = async (questId: string) => {
    await deleteDoc(doc(db, "quests", questId));
  };

  // ── Firestore: 포인트 차감 (runTransaction으로 race condition 방지) ──
  const spendPoints = async (uid: string, amount: number): Promise<boolean> => {
    try {
      const userRef = doc(db, "users", uid);
      let success = false;
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        const currentPts = (snap.data()?.points as number) ?? 0;
        if (currentPts < amount) return;
        tx.update(userRef, { points: increment(-amount) });
        success = true;
      });
      if (success) setUserPoints((prev) => prev - amount);
      return success;
    } catch (e) {
      console.error("포인트 차감 실패:", e);
      return false;
    }
  };

  // ── Firestore: 퀘스트 완료 처리 + 헌터 포인트 지급 ──
  const completeQuest = async (questId: string, hunterUid: string, rewardAmount: number) => {
    // 퀘스트 status → completed
    await updateDoc(doc(db, "quests", questId), { status: "completed" });
    // 헌터 포인트 지급
    await updateDoc(doc(db, "users", hunterUid), { points: increment(rewardAmount) });
    // 헌터에게 알림 생성
    await addDoc(collection(db, "users", hunterUid, "notifications"), {
      type: "reward",
      title: "보상 포인트 지급! 🎉",
      description: `분실물 찾기 완료 보상 +${rewardAmount.toLocaleString()} 포인트가 지급되었습니다.`,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  // ── Firestore: 채팅 메시지 전송 ──
  const sendMessage = async (chatId: string, text: string, username: string) => {
    const newMsg = {
      content: text,
      type: "me" as const,
      username,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: serverTimestamp(),
    };
    setChatMessages((prev) => [
      ...prev,
      { ...newMsg, id: String(Date.now()), createdAt: undefined },
    ]);
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), newMsg);
    } catch (e) {
      console.error("메시지 전송 실패:", e);
    }
  };

  return (
    <AppContext.Provider
      value={{ quests, premiumQuest, userPoints, unreadCount, loadingQuests, addQuest, spendPoints, completeQuest, chatMessages, sendMessage, setUserPoints, updateQuest, deleteQuest }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
