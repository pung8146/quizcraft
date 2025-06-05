"use client";

import { useState, useEffect } from "react";
import {
  sharedDocs,
  getAllCategories,
  getSharedDocsByCategory,
  searchSharedDocs,
  type SharedDoc,
} from "@/lib/sharedDocs";

interface SharedDocsGalleryProps {
  onSelectDoc: (content: string) => void;
  className?: string;
}

export default function SharedDocsGallery({
  onSelectDoc,
  className = "",
}: SharedDocsGalleryProps) {
  const [filteredDocs, setFilteredDocs] = useState<SharedDoc[]>(sharedDocs);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("popular");
  const [selectedDoc, setSelectedDoc] = useState<string>("");

  const categories = getAllCategories();

  useEffect(() => {
    let docs = [...sharedDocs];

    // 카테고리 필터링
    if (selectedCategory !== "all") {
      docs = getSharedDocsByCategory(selectedCategory);
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      docs = searchSharedDocs(searchQuery);
      if (selectedCategory !== "all") {
        docs = docs.filter((doc) => doc.category === selectedCategory);
      }
    }

    // 정렬
    if (sortBy === "popular") {
      docs.sort((a, b) => b.likes - a.likes);
    } else {
      docs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    setFilteredDocs(docs);
  }, [selectedCategory, searchQuery, sortBy]);

  const handleSelectDoc = (doc: SharedDoc) => {
    setSelectedDoc(doc.id);
    onSelectDoc(doc.content);
  };

  const handleKeyDown = (event: React.KeyboardEvent, doc: SharedDoc) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelectDoc(doc);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatViewsAndLikes = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div
      className={`bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="mb-4 sm:mb-0">
          <h3 className="font-semibold text-purple-900 text-base sm:text-lg mb-2">
            🌐 커뮤니티 문서 갤러리
          </h3>
          <p className="text-sm text-purple-700">
            다른 사용자들이 공유한 다양한 학습 자료를 둘러보세요!
          </p>
        </div>

        {/* 정렬 옵션 */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("popular")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortBy === "popular"
                ? "bg-purple-200 text-purple-900 font-medium"
                : "bg-white text-purple-700 hover:bg-purple-100"
            }`}
          >
            ❤️ 인기순
          </button>
          <button
            onClick={() => setSortBy("recent")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              sortBy === "recent"
                ? "bg-purple-200 text-purple-900 font-medium"
                : "bg-white text-purple-700 hover:bg-purple-100"
            }`}
          >
            🕒 최신순
          </button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* 검색바 */}
        <div>
          <input
            type="text"
            placeholder="문서 제목, 내용, 태그로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* 카테고리 선택 */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">모든 카테고리</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 문서 목록 */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-8 text-purple-600">
          <p className="text-lg mb-2">😕 검색 결과가 없습니다</p>
          <p className="text-sm">다른 키워드로 검색해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleSelectDoc(doc)}
              onKeyDown={(e) => handleKeyDown(e, doc)}
              className={`p-4 text-left rounded-lg border transition-all hover:shadow-md ${
                selectedDoc === doc.id
                  ? "bg-purple-100 border-purple-300 ring-2 ring-purple-200 shadow-md"
                  : "bg-white border-purple-200 hover:bg-purple-50 hover:border-purple-300"
              }`}
              tabIndex={0}
              aria-label={`${doc.title} 문서 선택`}
            >
              {/* 문서 헤더 */}
              <div className="mb-3">
                <h4 className="font-medium text-purple-900 text-sm mb-2 line-clamp-2">
                  {doc.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-purple-600 mb-2">
                  <span className="flex items-center gap-1">
                    👤 {doc.author}
                  </span>
                  <span className="bg-purple-100 px-2 py-0.5 rounded text-purple-800">
                    {doc.category}
                  </span>
                </div>
              </div>

              {/* 문서 미리보기 */}
              <p className="text-xs text-purple-700 line-clamp-3 mb-3">
                {doc.content
                  .split("\n")
                  .find((line) => line.trim() && !line.startsWith("#"))
                  ?.substring(0, 100) || doc.content.substring(0, 100)}
                ...
              </p>

              {/* 태그 */}
              <div className="flex flex-wrap gap-1 mb-3">
                {doc.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-purple-200 text-purple-800 text-xs px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {doc.tags.length > 3 && (
                  <span className="text-xs text-purple-600">
                    +{doc.tags.length - 3}
                  </span>
                )}
              </div>

              {/* 통계 정보 */}
              <div className="flex items-center justify-between text-xs text-purple-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    ❤️ {formatViewsAndLikes(doc.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    👁️ {formatViewsAndLikes(doc.views)}
                  </span>
                </div>
                <span>{formatDate(doc.createdAt)}</span>
              </div>

              {/* 선택됨 표시 */}
              {selectedDoc === doc.id && (
                <div className="mt-3 flex items-center justify-center">
                  <span className="text-xs text-purple-600 font-medium">
                    ✓ 선택됨
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 하단 팁 */}
      <div className="mt-6 p-4 bg-purple-100 rounded-lg">
        <p className="text-xs sm:text-sm text-purple-700">
          💡 <strong>팁:</strong> 마음에 드는 문서를 선택하면 에디터에 자동으로
          내용이 입력됩니다. 내용을 그대로 사용하거나 수정해서 퀴즈를
          만들어보세요!
        </p>
      </div>
    </div>
  );
}
