import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export interface AppNotification {
  type: "quest" | "reward" | "message" | "alert" | "match";
  title: string;
  description: string;
  read: boolean;
  urgent?: boolean;
}

/** uid 유저의 알림 컬렉션에 새 알림 문서를 추가합니다. */
export async function createNotification(uid: string, notification: AppNotification) {
  try {
    await addDoc(collection(db, "users", uid, "notifications"), {
      ...notification,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("알림 생성 실패:", e);
  }
}

/** Firestore Timestamp → 상대적 시간 문자열 변환 */
export function formatRelativeTime(date: Date | undefined): string {
  if (!date) return "";
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "방금";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`;
  const days = Math.floor(diff / 86_400_000);
  return days === 1 ? "어제" : `${days}일 전`;
}
