import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db, googleProvider } from "../../firebase";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  points: number;
  createdAt: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 구글 로그인
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Firestore에 사용자 문서가 없으면 새로 생성
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName ?? "익명 사용자",
          photoURL: user.photoURL ?? "",
          email: user.email ?? "",
          points: 10000, // 신규 가입 기본 포인트
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
      }
    } catch (error) {
      console.error("구글 로그인 실패:", error);
      toast.error("로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // 로그아웃
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  // 로그인 상태 감지 & 프로필 실시간 구독
  useEffect(() => {
    // 프로필 onSnapshot 구독 해제용 참조
    let profileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      // 이전 프로필 구독 정리
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (user) {
        const userRef = doc(db, "users", user.uid);
        // onSnapshot: 포인트/프로필 변경 시 실시간 반영
        profileUnsubscribe = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          }
          setLoading(false);
        }, (error) => {
          console.error("프로필 구독 오류:", error);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
