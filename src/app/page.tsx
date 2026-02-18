"use client";
import { useState, useEffect, useMemo } from "react";
import type { Post, GameStatus } from "@/app/_types/Post";
import { STATUS_MAP } from "@/app/_types/Post";
import PostSummary from "@/app/_components/PostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  status: GameStatus;
  playTime: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  categories: { category: { id: string; name: string } }[];
};

const STATUS_TABS: { key: GameStatus | "ALL"; label: string; emoji: string }[] =
  [
    { key: "ALL", label: "すべて", emoji: "🎮" },
    { key: "PLAYING", label: "プレイ中", emoji: "🎮" },
    { key: "UNPLAYED", label: "積みゲー", emoji: "📦" },
    { key: "COMPLETED", label: "クリア済み", emoji: "✅" },
    { key: "PERFECT", label: "100%達成", emoji: "🏆" },
  ];

const formatHours = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  return h >= 1000 ? `${(h / 1000).toFixed(1)}k` : `${h}`;
};

const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GameStatus | "ALL">("ALL");
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [postsRes, catsRes] = await Promise.all([
          fetch("/api/posts", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        if (!postsRes.ok) throw new Error("データ取得失敗");
        const data = (await postsRes.json()) as PostApiResponse[];
        setPosts(
          data.map((p) => ({
            ...p,
            categories: p.categories.map((c) => c.category),
          })),
        );
        if (catsRes.ok) setCategories(await catsRes.json());
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : "エラーが発生しました");
      }
    };
    fetchAll();
  }, []);

  // 統計計算
  const stats = useMemo(() => {
    if (!posts) return null;
    const total = posts.length;
    const playing = posts.filter((p) => p.status === "PLAYING").length;
    const unplayed = posts.filter((p) => p.status === "UNPLAYED").length;
    const completed = posts.filter((p) => p.status === "COMPLETED").length;
    const perfect = posts.filter((p) => p.status === "PERFECT").length;
    const totalMin = posts.reduce((s, p) => s + p.playTime, 0);
    const clearRate =
      total > 0 ? Math.round(((completed + perfect) / total) * 100) : 0;
    return {
      total,
      playing,
      unplayed,
      completed,
      perfect,
      totalMin,
      clearRate,
    };
  }, [posts]);

  // フィルタリング
  const filtered = useMemo(() => {
    if (!posts) return null;
    return posts.filter((p) => {
      if (activeTab !== "ALL" && p.status !== activeTab) return false;
      if (
        searchText &&
        !p.title.toLowerCase().includes(searchText.toLowerCase())
      )
        return false;
      if (
        selectedCategoryId &&
        !p.categories?.some((c) => c.id === selectedCategoryId)
      )
        return false;
      return true;
    });
  }, [posts, activeTab, searchText, selectedCategoryId]);

  if (fetchError)
    return <div className="mt-8 text-center text-red-400">{fetchError}</div>;

  if (!posts)
    return (
      <div className="flex h-40 items-center justify-center text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
        読み込み中...
      </div>
    );

  return (
    <main className="pb-10">
      {/* ─── 統計ダッシュボード ──────────────────────────────── */}
      {stats && (
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-700/50">
          {/* グラデーションヘッダー */}
          <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-indigo-900/80 px-4 py-3">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xl font-black text-white">
                  {stats.total}
                </div>
                <div className="text-[11px] text-slate-400">総ゲーム数</div>
              </div>
              <div>
                <div className="text-xl font-black text-blue-400">
                  {stats.playing}
                </div>
                <div className="text-[11px] text-slate-400">プレイ中</div>
              </div>
              <div>
                <div
                  className={twMerge(
                    "text-xl font-black",
                    stats.unplayed >= 5 ? "text-red-400" : "text-slate-400",
                  )}
                >
                  {stats.unplayed}
                </div>
                <div className="text-[11px] text-slate-400">積みゲー</div>
              </div>
              <div>
                <div className="text-xl font-black text-purple-400">
                  {formatHours(stats.totalMin)}h
                </div>
                <div className="text-[11px] text-slate-400">総プレイ時間</div>
              </div>
            </div>
          </div>
          {/* 積みゲー警告 */}
          {stats.unplayed >= 5 && (
            <div className="border-t border-red-800/50 bg-red-900/40 px-4 py-2 text-center text-xs font-bold text-red-300">
              🚨 積みゲーが {stats.unplayed} 本あります！ クリア率{" "}
              {stats.clearRate}%
            </div>
          )}
        </section>
      )}

      {/* ─── ステータスタブ ──────────────────────────────────── */}
      <div className="scrollbar-none mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.key === "ALL"
              ? posts.length
              : posts.filter((p) => p.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={twMerge(
                "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
                activeTab === tab.key
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/25"
                  : "border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700",
              )}
            >
              {tab.label}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 検索 & カテゴリフィルター ──────────────────────── */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-slate-500"
          />
          <input
            type="text"
            placeholder="ゲームを検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2 pr-3 pl-8 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-300 focus:border-purple-500 focus:outline-none"
          >
            <option value="">全プラットフォーム</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        {(searchText || selectedCategoryId) && (
          <button
            onClick={() => {
              setSearchText("");
              setSelectedCategoryId("");
            }}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 text-slate-500 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {/* 件数表示 */}
      {filtered && (
        <div className="mb-3 text-xs font-medium text-slate-500">
          {filtered.length} 本
          {filtered.length !== posts.length && `（全 ${posts.length} 本中）`}
        </div>
      )}

      {/* ─── ゲームグリッド ──────────────────────────────────── */}
      {filtered && filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          <div className="mb-2 text-4xl">🎮</div>
          <div className="text-sm">ゲームが見つかりません</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered?.map((post) => (
            <PostSummary key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;
