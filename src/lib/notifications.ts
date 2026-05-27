import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export interface NotificationData {
  type: "reward" | "report" | "match" | "system";
  title: string;
  description: string;
  read?: boolean;
  questId?: string;
}

/**
 * 특정 유저의 알림 서브컬렉션에 알림을 생성합니다.
 */
export async function createNotification(uid: string, data: NotificationData): Promise<void> {
  await addDoc(collection(db, "users", uid, "notifications"), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * 알림 생성 시각을 사람이 읽기 좋은 형식으로 변환합니다.
 */
export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}
