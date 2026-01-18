"use client";
import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTrash,
  faEdit,
  faPlus,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import dayjs from "dayjs";

type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  createdAt: string;
  updatedAt: string;
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
};

type Category = {
  id: string;
  name: string;
};

const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostApiResponse[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 検索・フィルター用のState
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const requestUrl = "/api/posts";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        setPosts(null);
        const errorBody = await res.json();
        throw new Error(errorBody.error || `${res.status}: ${res.statusText}`);
      }

      const apiResBody = (await res.json()) as PostApiResponse[];
      setPosts(apiResBody);
      setFetchErrorMsg(null);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事の一覧のフェッチに失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", {
        method: "GET",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("カテゴリの取得に失敗:", error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      alert("削除しました");
      await fetchPosts();
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `削除に失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました`;
      console.error(errorMsg);
      alert(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearFilters = () => {
    setSearchText("");
    setSelectedCategoryId("");
    setStartDate("");
    setEndDate("");
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  // フィルタリング処理
  const filteredPosts = useMemo(() => {
    if (!posts) return null;

    return posts.filter((post) => {
      // テキスト検索（タイトルと本文）
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(searchLower);
        const matchContent = post.content.toLowerCase().includes(searchLower);
        if (!matchTitle && !matchContent) return false;
      }

      // カテゴリフィルター
      if (selectedCategoryId) {
        const hasCategory = post.categories.some(
          (cat) => cat.category.id === selectedCategoryId,
        );
        if (!hasCategory) return false;
      }

      // 日付範囲フィルター
      const postDate = dayjs(post.createdAt);
      if (startDate && postDate.isBefore(dayjs(startDate), "day")) {
        return false;
      }
      if (endDate && postDate.isAfter(dayjs(endDate), "day")) {
        return false;
      }

      return true;
    });
  }, [posts, searchText, selectedCategoryId, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!posts) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  const dtFmt = "YYYY-MM-DD HH:mm";
  const hasActiveFilters =
    searchText || selectedCategoryId || startDate || endDate;

  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xl font-bold">投稿記事の管理</div>
        <Link
          href="/admin/posts/new"
          className={twMerge(
            "rounded-md px-4 py-2 font-bold",
            "bg-indigo-500 text-white hover:bg-indigo-600",
          )}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          新規作成
        </Link>
      </div>

      {/* 検索・フィルターセクション */}
      <div className="mb-4 rounded-lg border border-slate-300 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-bold text-slate-700">
            <FontAwesomeIcon icon={faSearch} className="mr-2" />
            検索・フィルター
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-1" />
              フィルターをクリア
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {/* テキスト検索 */}
          <div>
            <label className="mb-1 block text-sm font-bold">
              タイトル・本文で検索
            </label>
            <input
              type="text"
              placeholder="検索キーワードを入力..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {/* カテゴリフィルター */}
          <div>
            <label className="mb-1 block text-sm font-bold">
              カテゴリで絞り込み
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">すべてのカテゴリ</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 日付範囲 */}
          <div>
            <label className="mb-1 block text-sm font-bold">開始日</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">終了日</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 検索結果表示 */}
      <div className="mb-3 text-sm text-gray-600">
        {filteredPosts && (
          <>
            検索結果: <span className="font-bold">{filteredPosts.length}</span>{" "}
            件
            {posts.length !== filteredPosts.length && (
              <span className="ml-1">（全 {posts.length} 件中）</span>
            )}
          </>
        )}
      </div>

      {filteredPosts && filteredPosts.length === 0 ? (
        <div className="text-gray-500">
          {hasActiveFilters
            ? "検索条件に一致する投稿記事が見つかりませんでした。"
            : "（投稿記事は1個も作成されていません）"}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts?.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-slate-300 p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="mb-1 text-lg font-bold">{post.title}</div>
                  <div className="text-sm text-gray-600">
                    作成: {dayjs(post.createdAt).format(dtFmt)} / 更新:{" "}
                    {dayjs(post.updatedAt).format(dtFmt)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className={twMerge(
                      "rounded-md px-3 py-1.5 text-sm font-bold",
                      "bg-blue-500 text-white hover:bg-blue-600",
                    )}
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    disabled={deletingId === post.id}
                    className={twMerge(
                      "rounded-md px-3 py-1.5 text-sm font-bold",
                      "bg-red-500 text-white hover:bg-red-600",
                      deletingId === post.id && "opacity-50",
                    )}
                  >
                    {deletingId === post.id ? (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="animate-spin"
                      />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        削除
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex space-x-1.5">
                {post.categories.map((cat) => (
                  <div
                    key={cat.category.id}
                    className={twMerge(
                      "rounded-md px-2 py-0.5",
                      "text-xs font-bold",
                      "border border-slate-400 text-slate-500",
                    )}
                  >
                    {cat.category.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;
