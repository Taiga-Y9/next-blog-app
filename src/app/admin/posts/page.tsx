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
import { STATUS_MAP } from "@/app/_types/Post";
import type { GameStatus } from "@/app/_types/Post";

type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  createdAt: string;
  updatedAt: string;
  status: GameStatus;
  rating: number;
  playTime: number;
  categories: { category: { id: string; name: string } }[];
};

type Category = { id: string; name: string };

const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostApiResponse[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/posts", {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      setPosts(await res.json());
      setFetchErrorMsg(null);
    } catch (error) {
      setFetchErrorMsg(
        error instanceof Error ? error.message : "エラーが発生しました",
      );
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
      if (res.ok) setCategories(await res.json());
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchPosts();
    } catch {
      alert("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearFilters = () => {
    setSearchText("");
    setSelectedCategoryId("");
    setSelectedStatus("");
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!posts) return null;
    return posts.filter((post) => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (
          !post.title.toLowerCase().includes(q) &&
          !post.content.toLowerCase().includes(q)
        )
          return false;
      }
      if (
        selectedCategoryId &&
        !post.categories.some((c) => c.category.id === selectedCategoryId)
      )
        return false;
      if (selectedStatus && post.status !== selectedStatus) return false;
      return true;
    });
  }, [posts, searchText, selectedCategoryId, selectedStatus]);

  if (isLoading)
    return (
      <div className="mt-8 text-center text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
        Loading...
      </div>
    );
  if (!posts) return <div className="text-red-400">{fetchErrorMsg}</div>;

  const hasActiveFilters = searchText || selectedCategoryId || selectedStatus;

  return (
    <main className="pb-10">
      <div className="mt-2 mb-5 flex items-center justify-between">
        <div>
          <h1 className="page-title-accent text-2xl font-black text-white">
            🎮 ゲーム管理
          </h1>
          <p className="mt-1 text-xs text-slate-500">{posts.length} 本登録中</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-1.5 rounded-xl bg-purple-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-purple-500/20 transition-colors hover:bg-purple-400"
        >
          <FontAwesomeIcon icon={faPlus} />
          追加
        </Link>
      </div>

      {/* 検索・フィルター */}
      <div className="mb-4 rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-400">
            <FontAwesomeIcon icon={faSearch} className="mr-1 text-purple-400" />
            検索・フィルター
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-1" />
              クリア
            </button>
          )}
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <input
            type="text"
            placeholder="タイトル・メモで検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 focus:border-purple-500 focus:outline-none"
          >
            <option value="">すべてのステータス</option>
            {(
              Object.entries(STATUS_MAP) as [
                GameStatus,
                (typeof STATUS_MAP)[GameStatus],
              ][]
            ).map(([k, v]) => (
              <option key={k} value={k}>
                {v.emoji} {v.label}
              </option>
            ))}
          </select>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 focus:border-purple-500 focus:outline-none"
          >
            <option value="">すべてのカテゴリ</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 件数 */}
      <div className="mb-3 text-xs font-semibold text-slate-500">
        {filteredPosts?.length ?? 0} 件表示
        {posts.length !== (filteredPosts?.length ?? 0) &&
          ` / 全 ${posts.length} 件`}
      </div>

      {/* ゲーム一覧 */}
      {filteredPosts && filteredPosts.length === 0 ? (
        <div className="py-10 text-center text-slate-500">
          {hasActiveFilters
            ? "条件に一致するゲームが見つかりません"
            : "ゲームが登録されていません"}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPosts?.map((post) => {
            const statusInfo =
              STATUS_MAP[post.status] ?? STATUS_MAP["UNPLAYED"];
            return (
              <div
                key={post.id}
                className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span
                        className={twMerge("status-badge", statusInfo.color)}
                      >
                        {statusInfo.emoji} {statusInfo.label}
                      </span>
                    </div>
                    <div className="truncate font-black text-white">
                      {post.title}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      登録: {dayjs(post.createdAt).format("YYYY/MM/DD")}
                      {post.playTime > 0 && (
                        <span className="ml-2 text-indigo-400">
                          ⏱ {Math.floor(post.playTime / 60)}h
                          {post.playTime % 60 > 0
                            ? `${post.playTime % 60}m`
                            : ""}
                        </span>
                      )}
                      {post.rating > 0 && (
                        <span className="ml-2 text-amber-400">
                          {"★".repeat(post.rating)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-500"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1" />
                      編集
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deletingId === post.id}
                      className={twMerge(
                        "rounded-xl border border-red-800/50 bg-red-900/50 px-3 py-1.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-900",
                        deletingId === post.id && "opacity-50",
                      )}
                    >
                      {deletingId === post.id ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faTrash} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Page;
