"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Inquiry {
  id: string;
  title: string;
  content: string;
  author_name: string;
  email?: string;
  status: string;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

interface InquiryFormData {
  title: string;
  content: string;
  author_name: string;
  email: string;
  is_public: boolean;
}

export default function InquiryPage() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState<InquiryFormData>({
    title: "",
    content: "",
    author_name: user?.user_metadata?.name || user?.email || "",
    email: user?.email || "",
    is_public: true,
  });

  // 사용자 정보가 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        author_name: user?.user_metadata?.name || user?.email || "",
        email: user?.email || "",
      }));
    }
  }, [user]);

  // 문의글 목록 불러오기
  const fetchInquiries = async (page: number = 1) => {
    try {
      setLoading(true);

      const headers: HeadersInit = {};

      // 로그인한 사용자의 경우 토큰 추가
      if (user) {
        const {
          data: { session },
        } = await import("@/lib/supabase").then(({ supabase }) =>
          supabase.auth.getSession()
        );
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch(`/api/inquiries?page=${page}&limit=10`, {
        headers,
      });
      const result = await response.json();

      if (result.success) {
        setInquiries(result.data.inquiries);
        setCurrentPage(result.data.pagination.currentPage);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        console.error("문의글 불러오기 실패:", result.error);
      }
    } catch (error) {
      console.error("문의글 불러오기 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // 문의글 작성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.author_name.trim()
    ) {
      alert("제목, 내용, 작성자명을 모두 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // 로그인한 사용자의 경우 토큰 추가
      if (user) {
        const {
          data: { session },
        } = await import("@/lib/supabase").then(({ supabase }) =>
          supabase.auth.getSession()
        );
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
      }

      // 디버깅 로그 추가
      console.log("📤 클라이언트에서 전송하는 데이터:", formData);

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      console.log("📥 서버 응답:", result);

      if (result.success) {
        alert("문의글이 성공적으로 등록되었습니다.");
        setFormData({
          title: "",
          content: "",
          author_name: user?.user_metadata?.name || user?.email || "",
          email: user?.email || "",
          is_public: true,
        });
        setShowForm(false);
        fetchInquiries(); // 목록 새로고침
      } else {
        alert(result.error || "문의글 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("문의글 작성 오류:", error);
      alert("문의글 작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 상태 표시 함수
  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { text: "대기중", color: "bg-yellow-100 text-yellow-800" },
      answered: { text: "답변완료", color: "bg-green-100 text-green-800" },
      closed: { text: "종료", color: "bg-gray-100 text-gray-800" },
    };

    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.pending;

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">문의게시판</h1>
          <p className="text-gray-600 mt-2">
            궁금한 점이 있으시면 언제든 문의해주세요.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          {showForm ? "목록보기" : "문의하기"}
        </button>
      </div>

      {/* 문의 작성 폼 */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">새 문의 작성</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="author_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  작성자명 *
                </label>
                <input
                  type="text"
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      author_name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  이메일 (선택)
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                제목 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                문의 내용 *
              </label>
              <textarea
                id="content"
                rows={6}
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors resize-vertical"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_public: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="is_public"
                className="ml-2 block text-sm text-gray-700"
              >
                공개 문의 (다른 사용자들도 볼 수 있습니다)
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg font-medium"
              >
                {submitting ? "등록중..." : "문의 등록"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg font-medium"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 문의글 목록 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">문의글을 불러오는 중...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">등록된 문의글이 없습니다.</p>
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {inquiry.title}
                </h3>
                {inquiry.is_public ? (
                  getStatusBadge(inquiry.status)
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    비공개
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <span className="font-medium">{inquiry.author_name}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(inquiry.created_at)}</span>
              </div>

              <div className="text-gray-700 whitespace-pre-wrap">
                {inquiry.content.length > 200 ? (
                  <>
                    {inquiry.content.substring(0, 200)}...
                    <button className="text-blue-600 hover:text-blue-800 ml-2">
                      더보기
                    </button>
                  </>
                ) : (
                  inquiry.content
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => fetchInquiries(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors"
            >
              이전
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchInquiries(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  page === currentPage
                    ? "bg-blue-600 text-white border border-blue-600"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => fetchInquiries(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-colors"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
