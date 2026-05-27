import { useState, useEffect, useRef } from "react";
import { X, MapPin, Loader, Navigation } from "lucide-react";
import { toast } from "sonner";

const KAKAO_MAP_API_KEY = import.meta.env.VITE_KAKAO_MAP_KEY as string;

interface LocationPickerModalProps {
  onClose: () => void;
  onSelect: (locationName: string, lat?: number, lng?: number) => void;
}

export function LocationPickerModal({ onClose, onSelect }: LocationPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  const [selectedAddress, setSelectedAddress] = useState<string>("안양역 1번 출구");
  const [selectedLatLng, setSelectedLatLng] = useState<{lat: number, lng: number} | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // 카카오맵 SDK 로드
  useEffect(() => {
    if (!KAKAO_MAP_API_KEY) {
      setMapError(true);
      return;
    }

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => setMapReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => setMapReady(true));
    };
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapReady || !mapContainerRef.current) return;

    const centerLat = 37.3943;
    const centerLng = 126.9568; // 안양역 부근 기본값

    const options = {
      center: new window.kakao.maps.LatLng(centerLat, centerLng),
      level: 4,
    };

    const map = new window.kakao.maps.Map(mapContainerRef.current, options);
    kakaoMapRef.current = map;

    // 초기 마커
    const markerPosition = new window.kakao.maps.LatLng(centerLat, centerLng);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
    });
    marker.setMap(map);
    markerRef.current = marker;
    setSelectedLatLng({ lat: centerLat, lng: centerLng });

    // 클릭 이벤트
    window.kakao.maps.event.addListener(map, "click", (mouseEvent: any) => {
      const latlng = mouseEvent.latLng;
      marker.setPosition(latlng);
      setSelectedLatLng({ lat: latlng.getLat(), lng: latlng.getLng() });
      
      // 주소 변환 (Geocoder)
      if (window.kakao.maps.services && window.kakao.maps.services.Geocoder) {
        setLoadingAddress(true);
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
          setLoadingAddress(false);
          if (status === window.kakao.maps.services.Status.OK) {
            const addr = result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;
            setSelectedAddress(addr);
          } else {
            setSelectedAddress("알 수 없는 위치");
          }
        });
      } else {
        setSelectedAddress("위치 선택됨");
      }
    });
  }, [mapReady]);

  const handleConfirm = () => {
    onSelect(selectedAddress, selectedLatLng?.lat, selectedLatLng?.lng);
  };

  return (
    <>
      <div className="absolute inset-0 z-[100]" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
      <div className="absolute z-[110] left-0 right-0 bottom-0 top-12 flex flex-col" style={{ background: "#ffffff", borderRadius: "24px 24px 0 0", boxShadow: "0 -4px 20px rgba(0,0,0,0.15)" }}>
        
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-[18px]" style={{ fontWeight: 800, color: "#111827" }}>지도에서 장소 선택</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* 지도 영역 */}
        <div className="flex-1 relative bg-gray-100">
          {mapError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <MapPin size={48} className="text-gray-300 mb-4" />
              <p className="text-[14px] text-gray-500 font-medium">지도를 불러올 수 없습니다.<br/>API 키 설정을 확인해주세요.</p>
            </div>
          ) : !mapReady ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader size={24} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <div ref={mapContainerRef} className="w-full h-full" />
          )}
          
          {/* 가이드 오버레이 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md pointer-events-none z-10 flex items-center gap-2 border border-gray-200">
            <Navigation size={14} className="text-indigo-600" />
            <span className="text-[13px] font-bold text-gray-800">지도를 터치하여 위치를 지정하세요</span>
          </div>
        </div>

        {/* 하단 정보 및 확인 버튼 */}
        <div className="p-5 bg-white rounded-t-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-20">
          <div className="mb-4">
            <p className="text-[12px] text-gray-500 font-semibold mb-1">선택된 장소</p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <MapPin size={18} className="text-indigo-600" />
              <div className="flex-1 min-w-0">
                {loadingAddress ? (
                  <span className="text-[14px] text-gray-400">주소 불러오는 중...</span>
                ) : (
                  <span className="text-[15px] font-bold text-gray-800 truncate block">{selectedAddress}</span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleConfirm}
            className="w-full py-4 rounded-xl text-[15px] flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "#ffffff", fontWeight: 800 }}
          >
            이 위치로 설정하기
          </button>
        </div>
      </div>
    </>
  );
}
