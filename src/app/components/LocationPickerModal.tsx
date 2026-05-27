import { useRef, useEffect, useState } from "react";
import { MapPin, X, Search } from "lucide-react";

interface LocationPickerModalProps {
  onClose: () => void;
  onSelect: (location: string) => void;
}

const PRESET_LOCATIONS = [
  "안양역 2번 출구",
  "범계역 1번 출구",
  "인덕원역 3번 출구",
  "평촌 중앙공원",
  "안양시청",
  "평촌역 주변",
  "안양 롯데백화점",
  "안양 이마트",
];

export function LocationPickerModal({ onClose, onSelect }: LocationPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [mapReady, setMapReady] = useState(false);

  const filteredLocations = PRESET_LOCATIONS.filter((loc) =>
    loc.includes(searchQuery)
  );

  // Kakao Maps SDK가 로드되어 있으면 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (window.kakao && window.kakao.maps) {
      try {
        const options = {
          center: new window.kakao.maps.LatLng(37.3943, 126.9568), // 안양시
          level: 4,
        };
        const map = new window.kakao.maps.Map(mapContainerRef.current, options);

        window.kakao.maps.event.addListener(map, "click", (mouseEvent: any) => {
          const latlng = mouseEvent.latLng;
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.coord2Address(
            latlng.getLng(),
            latlng.getLat(),
            (result: any[], status: string) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const addr =
                  result[0].road_address?.address_name ||
                  result[0].address?.address_name ||
                  `${latlng.getLat().toFixed(5)}, ${latlng.getLng().toFixed(5)}`;
                setSelectedLocation(addr);
              }
            }
          );
        });

        setMapReady(true);
      } catch {
        setMapReady(false);
      }
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md rounded-t-3xl flex flex-col overflow-hidden"
        style={{
          background: "#ffffff",
          maxHeight: "85vh",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-[17px]" style={{ fontWeight: 800, color: "#111827" }}>
              분실 장소 선택
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: "#9CA3AF" }}>
              지도를 탭하거나 아래 목록에서 선택하세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#F3F4F6" }}
          >
            <X size={18} style={{ color: "#6B7280" }} />
          </button>
        </div>

        {/* 검색창 */}
        <div className="px-5 mb-3 flex-shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="장소를 검색하세요"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] placeholder-gray-400"
              style={{
                background: "#F9FAFB",
                border: "1px solid rgba(0,0,0,0.1)",
                outline: "none",
                color: "#111827",
              }}
            />
          </div>
        </div>

        {/* 카카오 지도 영역 */}
        <div className="px-5 mb-3 flex-shrink-0">
          <div
            ref={mapContainerRef}
            className="w-full rounded-2xl overflow-hidden"
            style={{
              height: "180px",
              background: "rgba(124,58,237,0.06)",
              border: "1px solid rgba(124,58,237,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!mapReady && (
              <div className="flex flex-col items-center gap-2">
                <MapPin size={28} style={{ color: "#7C3AED" }} />
                <span className="text-[12px]" style={{ color: "#9CA3AF" }}>
                  지도를 불러오는 중...
                </span>
              </div>
            )}
          </div>
          {selectedLocation ? (
            <div
              className="mt-2 px-3 py-2 rounded-lg flex items-center gap-2"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}
            >
              <MapPin size={14} style={{ color: "#10B981" }} />
              <span className="text-[13px]" style={{ color: "#10B981", fontWeight: 600 }}>
                {selectedLocation}
              </span>
            </div>
          ) : null}
        </div>

        {/* 자주 쓰는 장소 목록 */}
        <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ scrollbarWidth: "none" }}>
          <p className="text-[11px] mb-2" style={{ color: "#9CA3AF", fontWeight: 600 }}>
            자주 쓰는 장소
          </p>
          <div className="space-y-2">
            {filteredLocations.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
                style={{
                  background:
                    selectedLocation === loc
                      ? "rgba(124,58,237,0.07)"
                      : "#F9FAFB",
                  border:
                    selectedLocation === loc
                      ? "1px solid rgba(124,58,237,0.35)"
                      : "1px solid rgba(0,0,0,0.07)",
                }}
              >
                <MapPin
                  size={16}
                  style={{
                    color: selectedLocation === loc ? "#7C3AED" : "#9CA3AF",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="text-[14px]"
                  style={{
                    color: selectedLocation === loc ? "#7C3AED" : "#111827",
                    fontWeight: selectedLocation === loc ? 700 : 400,
                  }}
                >
                  {loc}
                </span>
              </button>
            ))}
            {searchQuery && filteredLocations.length === 0 && (
              <button
                onClick={() => setSelectedLocation(searchQuery)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                style={{
                  background: "rgba(124,58,237,0.05)",
                  border: "1.5px dashed rgba(124,58,237,0.3)",
                }}
              >
                <MapPin size={16} style={{ color: "#7C3AED", flexShrink: 0 }} />
                <span className="text-[14px]" style={{ color: "#7C3AED", fontWeight: 600 }}>
                  "{searchQuery}" 직접 입력
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 확인 버튼 */}
        <div className="px-5 pb-6 pt-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button
            onClick={() => {
              if (selectedLocation) {
                onSelect(selectedLocation);
              }
            }}
            disabled={!selectedLocation}
            className="w-full py-3.5 rounded-xl text-[15px]"
            style={{
              background: selectedLocation
                ? "linear-gradient(135deg, #10B981, #059669)"
                : "#E5E7EB",
              color: selectedLocation ? "#ffffff" : "#9CA3AF",
              fontWeight: 800,
              boxShadow: selectedLocation ? "0 4px 14px rgba(16,185,129,0.3)" : "none",
            }}
          >
            {selectedLocation ? `"${selectedLocation}" 선택` : "장소를 선택해주세요"}
          </button>
        </div>
      </div>
    </div>
  );
}
