import { MapPin, Navigation, Crosshair, Layers, Zap, Coins } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";

// ─── 카카오맵 API 키 설정 ──────────────────────────────────────────────────────
const KAKAO_MAP_API_KEY = import.meta.env.VITE_KAKAO_MAP_KEY as string;

// ─── 카카오맵 타입 선언 ───────────────────────────────────────────────────────
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: object) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: object) => KakaoMarker;
        CustomOverlay: new (options: object) => KakaoOverlay;
        event: { addListener: (target: unknown, type: string, handler: () => void) => void };
      };
    };
  }
}
interface KakaoMap { setCenter: (latlng: KakaoLatLng) => void; }
interface KakaoLatLng { getLat: () => number; getLng: () => number; }
interface KakaoMarker { setMap: (map: KakaoMap | null) => void; }
interface KakaoOverlay { setMap: (map: KakaoMap | null) => void; }

const FILTER_OPTIONS = [
  { id: "all", label: "전체", icon: "🗺️" },
  { id: "urgent", label: "긴급", icon: "🔥" },
  { id: "electronics", label: "전자기기", icon: "💻" },
  { id: "pets", label: "반려동물", icon: "🐾" },
];

// 안양 지역 기본 좌표
const DEFAULT_CENTER = { lat: 37.3943, lng: 126.9568 };

interface MapScreenProps {
  onNavigateToFinder?: () => void;
}

export function MapScreen({ onNavigateToFinder }: MapScreenProps = {}) {
  const { quests } = useAppContext();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<KakaoMap | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [layers, setLayers] = useState({ quests: true, storage: false, traffic: false });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── 카카오맵 SDK 로드 ──
  useEffect(() => {
    if (!KAKAO_MAP_API_KEY) {
      // API 키 없으면 모의 지도 표시
      setMapError(true);
      return;
    }

    // 이미 로드된 경우 스킵
    if (window.kakao?.maps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        setMapReady(true);
      });
    };
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);
  }, []);

  // ── 지도 초기화 ──
  useEffect(() => {
    if (mapReady && mapContainerRef.current) {
      initMap();
    }
  }, [mapReady]);

  const initMap = () => {
    if (!mapContainerRef.current || !window.kakao?.maps) return;

    const center = new window.kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    const map = new window.kakao.maps.Map(mapContainerRef.current, {
      center,
      level: 5,
    });
    kakaoMapRef.current = map;

    // 퀘스트 마커 추가
    addQuestMarkers(map);
  };

  // ── 퀘스트 마커를 지도에 표시 ──
  const addQuestMarkers = (map: KakaoMap) => {
    quests.forEach((quest) => {
      // TODO: Quest에 lat/lng 필드가 생기면 실제 좌표로 표시
      // 현재는 안양 지역 임의 좌표에 마커 표시 (데모용)
      const lat = DEFAULT_CENTER.lat + (Math.random() - 0.5) * 0.03;
      const lng = DEFAULT_CENTER.lng + (Math.random() - 0.5) * 0.04;
      const position = new window.kakao.maps.LatLng(lat, lng);

      const isUrgent = quest.isPremium;
      const markerColor = isUrgent ? "#F59E0B" : "#7C3AED";

      const overlayContent = `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        " onclick="window.__selectMarker('${quest.id}')">
          <div style="
            width: 40px; height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${markerColor}, ${markerColor}cc);
            border: 3px solid white;
            box-shadow: 0 4px 16px ${markerColor}66;
            display: flex; align-items: center; justify-content: center;
            font-size: 18px;
          ">
            ${isUrgent ? "⚡" : "📍"}
          </div>
          <div style="
            width: 2px; height: 10px;
            background: ${markerColor};
          "></div>
        </div>
      `;

      new window.kakao.maps.CustomOverlay({
        position,
        content: overlayContent,
        yAnchor: 1,
        map,
      });
    });

    // 전역 콜백 등록 (마커 클릭 시)
    (window as Window & { __selectMarker?: (id: string) => void }).__selectMarker = (id) => {
      setSelectedQuest((prev) => (prev === id ? null : id));
    };
  };

  const handleCenterLocation = () => {
    if (!kakaoMapRef.current || !window.kakao?.maps) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        kakaoMapRef.current!.setCenter(latlng);
      },
      (err) => console.error("위치 정보를 가져올 수 없습니다:", err)
    );
  };

  const filteredQuests = quests.filter((q) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "urgent") return q.isPremium;
    if (selectedFilter === "electronics") return q.category === "전자기기";
    if (selectedFilter === "pets") return q.category === "반려동물";
    return true;
  });

  const selectedQuestData = quests.find((q) => q.id === selectedQuest);

  return (
    <div className="h-full relative flex flex-col" style={{ background: "#ffffff" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] mb-0.5" style={{ fontWeight: 800, letterSpacing: "-0.5px", color: "#111827" }}>
              퀘스트 지도
            </h1>
            <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
              근처 {filteredQuests.length}개 퀘스트
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#F3F4F6", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <Layers size={16} style={{ color: "#6B7280" }} />
            </button>
            <button
              onClick={handleCenterLocation}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }}
            >
              <Crosshair size={16} style={{ color: "#1a1200" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex-shrink-0 px-4 py-2" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {FILTER_OPTIONS.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] flex items-center gap-1.5 transition-all"
                style={
                  isActive
                    ? { background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#1a1200", fontWeight: 700 }
                    : { background: "#F3F4F6", color: "#6B7280", fontWeight: 500, border: "1px solid rgba(0,0,0,0.07)" }
                }
              >
                <span>{filter.icon}</span>
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* 실제 카카오맵 or 모의 지도 */}
        {!mapError && KAKAO_MAP_API_KEY ? (
          <div ref={mapContainerRef} className="absolute inset-0" />
        ) : (
          /* API 키 없을 때 보여주는 플레이스홀더 */
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" }}>
            <div className="text-center px-8">
              <div className="text-5xl mb-4">🗺️</div>
              <p className="text-[16px] mb-1" style={{ fontWeight: 800, color: "#111827" }}>카카오맵 연동 대기 중</p>
              <p className="text-[13px]" style={{ color: "#6B7280" }}>
                API 키를 받으시면<br />
                <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "rgba(245,158,11,0.15)", color: "#D97706" }}>KAKAO_MAP_API_KEY</code>에<br />
                붙여넣으면 즉시 활성화됩니다
              </p>

              {/* 등록된 퀘스트 목록으로 대체 표시 */}
              <div className="mt-6 space-y-2 text-left">
                {filteredQuests.slice(0, 3).map((q) => (
                  <div key={q.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "white", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={q.image} alt={q.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] truncate" style={{ fontWeight: 600, color: "#111827" }}>{q.title}</p>
                      <p className="text-[10px]" style={{ color: "#9CA3AF" }}>{q.location}</p>
                    </div>
                    <span className="text-[11px]" style={{ color: "#F59E0B", fontWeight: 700 }}>💰 {q.rewardShort}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 카카오맵 위에 올라가는 퀘스트 선택 카드 */}
        {selectedQuestData && (
          <div className="absolute bottom-4 left-4 right-4 z-30">
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.97)",
                backdropFilter: "blur(20px)",
                border: selectedQuestData.isPremium ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(0,0,0,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                {selectedQuestData.isPremium && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)" }}>
                    <Zap size={10} style={{ color: "#F59E0B" }} />
                    <span className="text-[10px]" style={{ color: "#D97706", fontWeight: 800 }}>긴급</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Navigation size={12} style={{ color: "#10B981" }} />
                  <span className="text-[12px]" style={{ color: "#10B981", fontWeight: 600 }}>{selectedQuestData.distance}</span>
                </div>
              </div>

              <h3 className="text-[16px] mb-2" style={{ fontWeight: 700, color: "#111827" }}>
                {selectedQuestData.title}
              </h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={16} style={{ color: "#F59E0B" }} />
                  <span className="text-[18px]" style={{ color: "#F59E0B", fontWeight: 900, letterSpacing: "-0.5px" }}>
                    {selectedQuestData.reward} KRW
                  </span>
                </div>
                <button
                  onClick={() => onNavigateToFinder?.()}
                  className="px-4 py-2 rounded-lg text-[13px] active:opacity-70 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#1a1200", fontWeight: 800 }}
                >
                  퀘스트 수락
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Layer Menu */}
      {showLayerMenu && (
        <div className="absolute top-24 right-4 z-40">
          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
            {(
              [
                { key: "quests" as const, label: "퀘스트 마커" },
                { key: "storage" as const, label: "보관소" },
                { key: "traffic" as const, label: "교통 정보" },
              ] as const
            ).map((layer, idx, arr) => {
              const enabled = layers[layer.key];
              return (
                <button
                  key={layer.key}
                  onClick={() => toggleLayer(layer.key)}
                  className="w-full px-4 py-3 text-left text-[13px] flex items-center justify-between"
                  style={{ borderBottom: idx < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                >
                  <span style={{ color: enabled ? "#111827" : "#9CA3AF", fontWeight: enabled ? 600 : 400 }}>
                    {layer.label}
                  </span>
                  <div
                    className="w-9 h-5 rounded-full flex items-center px-0.5 transition-colors duration-200"
                    style={{ background: enabled ? "#F59E0B" : "#E5E7EB" }}
                  >
                    <div
                      className="w-4 h-4 rounded-full transition-transform duration-200"
                      style={{
                        background: "white",
                        transform: enabled ? "translateX(16px)" : "translateX(0)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
