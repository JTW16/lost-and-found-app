import { Search, X, TrendingUp, Clock, MapPin, Coins } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const TRENDING_SEARCHES = [
  "에어팟",
  "지갑",
  "카메라",
  "반려동물",
  "휴대폰",
  "노트북",
];

const RECENT_SEARCHES = [
  "검은색 가죽 지갑",
  "맥북 프로",
  "안양역",
];

const SEARCH_RESULTS = [
  {
    id: 1,
    type: "quest",
    title: "검은색 가죽 지갑",
    location: "범계역 3번 출구",
    reward: "20,000",
    distance: "650m",
    image: "https://images.unsplash.com/photo-1629958513881-a086d21383cd?w=400",
  },
  {
    id: 2,
    type: "quest",
    title: "맥북 프로 16인치 실버",
    location: "안양역 2번 출구",
    reward: "100,000",
    distance: "300m",
    image: "https://images.unsplash.com/photo-1524226750215-b424f7377a80?w=400",
  },
  {
    id: 3,
    type: "storage",
    title: "GS25 안양역점 (습득물 보관중)",
    location: "안양시 만안구 안양로 50",
    distance: "120m",
  },
];

interface SearchScreenProps {
  onClose: () => void;
}

export function SearchScreen({ onClose }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setShowResults(true);
      if (!recentSearches.includes(query)) {
        setRecentSearches([query, ...recentSearches.slice(0, 4)]);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  const handleDeleteRecentSearch = (search: string) => {
    setRecentSearches(recentSearches.filter((s) => s !== search));
  };

  const categories = [
    { id: "all", label: "전체", icon: "🔍" },
    { id: "electronics", label: "전자기기", icon: "💻" },
    { id: "wallet", label: "지갑", icon: "👛" },
    { id: "pets", label: "반려동물", icon: "🐾" },
    { id: "bags", label: "가방", icon: "🎒" },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "#ffffff" }}>
      {/* Header with Search Bar */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#9CA3AF" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery);
                }
              }}
              placeholder="물건, 장소를 검색하세요..."
              autoFocus
              className="w-full pl-11 pr-10 py-3 rounded-xl text-[14px] placeholder-gray-400"
              style={{
                background: "#F3F4F6",
                border: "1px solid rgba(0,0,0,0.08)",
                outline: "none",
                color: "#111827",
              }}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "#E5E7EB" }}
              >
                <X size={14} style={{ color: "#6B7280" }} />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-3 py-3 rounded-xl text-[13px]"
            style={{ color: "#6B7280", fontWeight: 600 }}
          >
            취소
          </button>
        </div>

        {/* Category Filter */}
        {showResults && (
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(isActive ? null : category.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5"
                  style={
                    isActive
                      ? { background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#1a1200", fontWeight: 700 }
                      : {
                          background: "#F3F4F6",
                          color: "#6B7280",
                          fontWeight: 500,
                          border: "1px solid rgba(0,0,0,0.07)",
                        }
                  }
                >
                  <span>{category.icon}</span>
                  {category.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", background: "#F9FAFB" }}>
        {!showResults ? (
          <>
            {/* Trending Searches */}
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} style={{ color: "#F59E0B" }} />
                <span className="text-[13px]" style={{ fontWeight: 700, color: "#111827" }}>
                  인기 검색어
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="px-3 py-2 rounded-lg text-[12px] flex items-center gap-2"
                    style={{
                      background: "rgba(245,158,11,0.07)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      color: "#D97706",
                      fontWeight: 600,
                    }}
                  >
                    <span className="text-[10px]" style={{ color: "#9CA3AF" }}>
                      {index + 1}
                    </span>
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} style={{ color: "#9CA3AF" }} />
                    <span className="text-[13px]" style={{ fontWeight: 700, color: "#111827" }}>
                      최근 검색
                    </span>
                  </div>
                  <button
                    onClick={() => setRecentSearches([])}
                    className="text-[11px]"
                    style={{ color: "#9CA3AF", fontWeight: 600 }}
                  >
                    전체 삭제
                  </button>
                </div>

                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                      style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      <button
                        onClick={() => handleSearch(search)}
                        className="flex-1 text-left text-[13px]"
                        style={{ color: "#374151" }}
                      >
                        {search}
                      </button>
                      <button
                        onClick={() => handleDeleteRecentSearch(search)}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: "#F3F4F6" }}
                      >
                        <X size={12} style={{ color: "#9CA3AF" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="px-4 py-4">
              <div
                className="rounded-xl p-4"
                style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.18)" }}
              >
                <p className="text-[12px] mb-2" style={{ color: "#7C3AED", fontWeight: 700 }}>
                  💡 검색 팁
                </p>
                <ul className="text-[11px] space-y-1" style={{ color: "#6B7280", lineHeight: "1.5", paddingLeft: "16px" }}>
                  <li>물건 이름으로 검색해보세요 (예: 지갑, 에어팟)</li>
                  <li>장소로도 검색 가능합니다 (예: 안양역, 범계역)</li>
                  <li>카테고리 필터로 더 정확한 결과를 확인하세요</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          /* Search Results */
          <div className="px-4 py-4">
            <div className="mb-4">
              <p className="text-[13px]" style={{ color: "#9CA3AF" }}>
                '<span style={{ color: "#F59E0B", fontWeight: 700 }}>{searchQuery}</span>' 검색 결과{" "}
                <span style={{ color: "#111827", fontWeight: 700 }}>{SEARCH_RESULTS.length}건</span>
              </p>
            </div>

            <div className="space-y-3">
              {SEARCH_RESULTS.map((result) => (
                <div
                  key={result.id}
                  onClick={() => {
                    if (result.type === "quest") {
                      toast.success(`"${result.title}" 퀘스트`, { description: `${result.location} • ${result.distance}` });
                    } else {
                      toast.info(`${result.title}`, { description: result.location });
                    }
                  }}
                  className="rounded-xl overflow-hidden cursor-pointer"
                  style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                >
                  {result.type === "quest" && result.image ? (
                    <div className="flex items-center gap-3 p-3">
                      <div
                        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                      >
                        <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded mb-1"
                          style={{ background: "rgba(245,158,11,0.1)" }}
                        >
                          <span className="text-[9px]" style={{ color: "#D97706", fontWeight: 700 }}>
                            💰 퀘스트
                          </span>
                        </div>
                        <p className="text-[13px] mb-1" style={{ fontWeight: 600, color: "#111827" }}>
                          {result.title}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={10} style={{ color: "#9CA3AF" }} />
                          <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{result.location}</span>
                          <span style={{ color: "#D1D5DB", fontSize: "10px" }}>•</span>
                          <span className="text-[11px]" style={{ color: "#10B981", fontWeight: 600 }}>
                            {result.distance}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-end">
                        <Coins size={14} style={{ color: "#F59E0B", marginBottom: "2px" }} />
                        <span className="text-[14px]" style={{ color: "#F59E0B", fontWeight: 800 }}>
                          {result.reward}
                        </span>
                        <span className="text-[9px]" style={{ color: "#9CA3AF" }}>KRW</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3">
                      <div
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded mb-1"
                        style={{ background: "rgba(124,58,237,0.1)" }}
                      >
                        <span className="text-[9px]" style={{ color: "#7C3AED", fontWeight: 700 }}>
                          📦 보관소
                        </span>
                      </div>
                      <p className="text-[13px] mb-1" style={{ fontWeight: 600, color: "#111827" }}>
                        {result.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={10} style={{ color: "#9CA3AF" }} />
                        <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{result.location}</span>
                        <span style={{ color: "#D1D5DB", fontSize: "10px" }}>•</span>
                        <span className="text-[11px]" style={{ color: "#10B981", fontWeight: 600 }}>
                          {result.distance}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
