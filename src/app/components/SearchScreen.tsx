import { Search, X, TrendingUp, Clock, MapPin, Coins } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";

// #7: 인기 검색어 & 최근 검색어는 유지 (UX)
const TRENDING_SEARCHES = ["에어팟", "지갑", "카메라", "반려동물", "휴대폰", "노트북"];

interface SearchScreenProps {
  onClose: () => void;
}

export function SearchScreen({ onClose }: SearchScreenProps) {
  const { quests, premiumQuest } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(["검은색 가죽 지갑", "맥북 프로", "안양역"]);
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // #7: Firestore 실제 데이터 기반 검색
  const allQuests = [...(premiumQuest ? [premiumQuest] : []), ...quests];

  const categories = [
    { id: "all", label: "전체", icon: "🔍" },
    { id: "전자기기", label: "전자기기", icon: "💻" },
    { id: "지갑", label: "지갑", icon: "👛" },
    { id: "반려동물", label: "반려동물", icon: "🐾" },
    { id: "가방", label: "가방", icon: "🎒" },
  ];

  const filteredResults = allQuests.filter((q) => {
    const matchesQuery =
      searchQuery.trim() === "" ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || selectedCategory === "all" ||
      q.category === selectedCategory ||
      q.title.includes(selectedCategory);
    return matchesQuery && matchesCategory;
  });

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

  return (
    <div className="h-full flex flex-col" style={{ background: "#ffffff" }}>
      {/* Header with Search Bar */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(searchQuery); }}
              placeholder="물건, 장소를 검색하세요..."
              autoFocus
              className="w-full pl-11 pr-10 py-3 rounded-xl text-[14px] placeholder-gray-400"
              style={{ background: "#F3F4F6", border: "1px solid rgba(0,0,0,0.08)", outline: "none", color: "#111827" }}
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
          <button onClick={onClose} className="px-3 py-3 rounded-xl text-[13px]" style={{ color: "#6B7280", fontWeight: 600 }}>
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
                      : { background: "#F3F4F6", color: "#6B7280", fontWeight: 500, border: "1px solid rgba(0,0,0,0.07)" }
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
                <span className="text-[13px]" style={{ fontWeight: 700, color: "#111827" }}>인기 검색어</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="px-3 py-2 rounded-lg text-[12px] flex items-center gap-2"
                    style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", color: "#D97706", fontWeight: 600 }}
                  >
                    <span className="text-[10px]" style={{ color: "#9CA3AF" }}>{index + 1}</span>
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
                    <span className="text-[13px]" style={{ fontWeight: 700, color: "#111827" }}>최근 검색</span>
                  </div>
                  <button onClick={() => setRecentSearches([])} className="text-[11px]" style={{ color: "#9CA3AF", fontWeight: 600 }}>전체 삭제</button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)" }}>
                      <button onClick={() => handleSearch(search)} className="flex-1 text-left text-[13px]" style={{ color: "#374151" }}>{search}</button>
                      <button onClick={() => handleDeleteRecentSearch(search)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                        <X size={12} style={{ color: "#9CA3AF" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* #7: 실제 Firestore 퀘스트 검색 결과 */
          <div className="px-4 py-4">
            <div className="mb-4">
              <p className="text-[13px]" style={{ color: "#9CA3AF" }}>
                '<span style={{ color: "#F59E0B", fontWeight: 700 }}>{searchQuery}</span>' 검색 결과{" "}
                <span style={{ color: "#111827", fontWeight: 700 }}>{filteredResults.length}건</span>
              </p>
            </div>

            {filteredResults.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2">
                <span className="text-[32px]">🔍</span>
                <p className="text-[13px]" style={{ color: "#9CA3AF" }}>검색 결과가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="rounded-xl overflow-hidden cursor-pointer"
                    style={{ background: "#ffffff", border: result.isPremium ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                        <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded mb-1" style={{ background: "rgba(245,158,11,0.1)" }}>
                          <span className="text-[9px]" style={{ color: "#D97706", fontWeight: 700 }}>💰 퀘스트</span>
                        </div>
                        <p className="text-[13px] mb-1 truncate" style={{ fontWeight: 600, color: "#111827" }}>{result.title}</p>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={10} style={{ color: "#9CA3AF" }} />
                          <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{result.location}</span>
                          <span style={{ color: "#D1D5DB", fontSize: "10px" }}>•</span>
                          <span className="text-[11px]" style={{ color: "#10B981", fontWeight: 600 }}>{result.distance}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end">
                        <Coins size={14} style={{ color: "#F59E0B", marginBottom: "2px" }} />
                        <span className="text-[14px]" style={{ color: "#F59E0B", fontWeight: 800 }}>{result.reward}</span>
                        <span className="text-[9px]" style={{ color: "#9CA3AF" }}>KRW</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
