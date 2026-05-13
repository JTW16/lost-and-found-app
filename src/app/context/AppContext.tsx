import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
} from "firebase/firestore";
import { db } from "../../firebase";

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
  loadingQuests: boolean;
  addQuest: (quest: Omit<Quest, "id" | "rewardShort" | "isNew" | "distance" | "createdAt">) => Promise<void>;
  spendPoints: (uid: string, amount: number) => Promise<boolean>;
  chatMessages: ChatMessage[];
  sendMessage: (chatId: string, text: string, username: string) => Promise<void>;
  setUserPoints: (points: number) => void;
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
};

const DEMO_QUESTS: Quest[] = [
  { id: "demo-1", image: "https://images.unsplash.com/photo-1646848842285-d4c14f43781e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", reward: "20,000", rewardShort: "20k", title: "검은 가죽 지갑 분실", location: "범계역", distance: "650m", isNew: true },
  { id: "demo-2", image: "https://images.unsplash.com/photo-1773093758897-0becd0af36b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", reward: "30,000", rewardShort: "30k", title: "따릉이 번호판 & 자물쇠 분실", location: "평촌중앙공원", distance: "1.2km", isNew: false },
  { id: "demo-3", image: "https://images.unsplash.com/photo-1768081529866-a5ec754fe14c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", reward: "50,000", rewardShort: "50k", title: "소니 FE 24-70mm 렌즈 분실", location: "인덕원역 근처", distance: "2.1km", isNew: true },
  { id: "demo-4", image: "https://images.unsplash.com/photo-1550894832-407b1aa5a3af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", reward: "80,000", rewardShort: "80k", title: "포메라니안 '호두' 실종 (흰색·수컷)", location: "학의동 일원", distance: "3.4km", isNew: false },
];

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<Quest[]>(DEMO_QUESTS);
  const [premiumQuest, setPremiumQuest] = useState<Quest | null>(DEMO_PREMIUM);
  const [userPoints, setUserPoints] = useState<number>(10000);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(true);

  // ── Firestore: quests 컬렉션 실시간 구독 ──
  useEffect(() => {
    const q = query(collection(db, "quests"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allQuests: Quest[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Quest, "id">),
      }));

      const premium = allQuests.find((q) => q.isPremium) ?? null;
      const regular = allQuests.filter((q) => !q.isPremium);

      // Firestore에 데이터가 있으면 대체, 없으면 데모 유지
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

  // ── Firestore: 퀘스트(분실물) 등록 ──
  const addQuest = async (newQuestData: Omit<Quest, "id" | "rewardShort" | "isNew" | "distance" | "createdAt">) => {
    const parsedReward = parseInt(newQuestData.reward.replace(/,/g, ""), 10) || 0;
    const rewardShort = parsedReward > 0 ? `${Math.floor(parsedReward / 1000)}k` : "0k";

    const docData = {
      ...newQuestData,
      rewardShort,
      distance: "0m",
      isNew: true,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "quests"), docData);
  };

  // ── Firestore: 포인트 차감 ──
  const spendPoints = async (uid: string, amount: number): Promise<boolean> => {
    if (userPoints >= amount) {
      // 로컬 상태 즉시 반영
      setUserPoints((prev) => prev - amount);
      // Firestore 사용자 문서 업데이트
      try {
        await updateDoc(doc(db, "users", uid), {
          points: increment(-amount),
        });
      } catch (e) {
        console.error("포인트 차감 실패:", e);
      }
      return true;
    }
    return false;
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

    // 낙관적 업데이트 (즉시 화면에 표시)
    setChatMessages((prev) => [
      ...prev,
      { ...newMsg, id: String(Date.now()), createdAt: undefined },
    ]);

    // Firestore에 저장
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), newMsg);
    } catch (e) {
      console.error("메시지 전송 실패:", e);
    }
  };

  return (
    <AppContext.Provider
      value={{ quests, premiumQuest, userPoints, loadingQuests, addQuest, spendPoints, chatMessages, sendMessage, setUserPoints }}
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
