"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/app/_hooks/useAuth";
import type { GameStatus } from "@/app/_types/Post";
import { STATUS_MAP } from "@/app/_types/Post";

type SelectableCategory = { id: string; name: string; isSelect: boolean };

const STATUSES: GameStatus[] = ["UNPLAYED", "PLAYING", "COMPLETED", "PERFECT"];

const Page: React.FC = () => {
  const router = useRouter();
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkableCategories, setCheckableCategories] = useState<
    SelectableCategory[] | null
  >(null);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [status, setStatus] = useState<GameStatus>("UNPLAYED");
  const [playTimeH, setPlayTimeH] = useState(0);
  const [playTimeM, setPlayTimeM] = useState(0);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/categories", {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setCheckableCategories(
          data.map((c: { id: string; name: string }) => ({
            ...c,
            isSelect: false,
          })),
        );
      } catch {
        setFetchErrorMsg("カテゴリの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (id: string) =>
    setCheckableCategories(
      (prev) =>
        prev?.map((c) => (c.id === id ? { ...c, isSelect: !c.isSelect } : c)) ??
        null,
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("ログインが必要です");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          title,
          content,
          coverImageURL,
          status,
          playTime: playTimeH * 60 + playTimeM,
          rating,
          categoryIds:
            checkableCategories?.filter((c) => c.isSelect).map((c) => c.id) ??
            [],
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const created = await res.json();
      router.push(`/posts/${created.id}`);
    } catch {
      alert("登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="mt-8 text-center text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
        Loading...
      </div>
    );
  if (!checkableCategories)
    return <div className="text-red-400">{fetchErrorMsg}</div>;

  return (
    <main className="pb-10">
      <h1 className="page-title-accent mb-1 text-2xl font-black text-white">
        🎮 ゲームを追加
      </h1>
      <p className="mt-2 mb-6 text-xs text-slate-500">
        プレイしたゲームをライブラリに登録しましょう
      </p>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-6 py-4 shadow-2xl">
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-purple-400"
            />
            <span className="font-bold text-slate-300">登録中...</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={twMerge(
          "space-y-5",
          isSubmitting && "pointer-events-none opacity-50",
        )}
      >
        {/* タイトル */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-300">
            ゲームタイトル <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: ゼルダの伝説 ティアーズ オブ ザ キングダム"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            required
          />
        </div>

        {/* ステータス */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-300">
            ステータス
          </label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const info = STATUS_MAP[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={twMerge(
                    "rounded-full border px-3 py-1.5 text-sm font-bold transition-all",
                    status === s
                      ? "border-purple-400 bg-purple-500 text-white shadow-md shadow-purple-500/20"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500",
                  )}
                >
                  {info.emoji} {info.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 評価 */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-300">
            評価
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s === rating ? 0 : s)}
                className={twMerge(
                  "text-2xl transition-transform hover:scale-110 focus:outline-none",
                  s <= rating ? "text-amber-400" : "text-slate-700",
                )}
              >
                ★
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-1 self-center text-xs text-slate-500">
                {rating} / 5
              </span>
            )}
          </div>
        </div>

        {/* プレイ時間 */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-300">
            プレイ時間
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={playTimeH}
              onChange={(e) =>
                setPlayTimeH(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-20 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-center text-white focus:border-purple-500 focus:outline-none"
            />
            <span className="text-sm text-slate-400">時間</span>
            <input
              type="number"
              min={0}
              max={59}
              value={playTimeM}
              onChange={(e) =>
                setPlayTimeM(
                  Math.max(0, Math.min(59, parseInt(e.target.value) || 0)),
                )
              }
              className="w-20 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-center text-white focus:border-purple-500 focus:outline-none"
            />
            <span className="text-sm text-slate-400">分</span>
          </div>
        </div>

        {/* カバー画像URL */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-300">
            カバー画像URL
          </label>
          <input
            type="url"
            value={coverImageURL}
            onChange={(e) => setCoverImageURL(e.target.value)}
            placeholder="https://example.com/game.jpg"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* プラットフォーム/カテゴリ */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-300">
            プラットフォーム / ジャンル
          </label>
          {checkableCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {checkableCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  className={twMerge(
                    "rounded-lg border px-3 py-1.5 text-sm font-bold transition-all",
                    c.isSelect
                      ? "border-indigo-400 bg-indigo-600 text-white"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              カテゴリがありません。
              <Link
                href="/admin/categories/new"
                className="ml-1 text-indigo-400 hover:underline"
              >
                こちらから追加できます
              </Link>
            </p>
          )}
        </div>

        {/* メモ・感想 */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-300">
            メモ・感想
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="攻略メモ、感想、印象に残ったシーンなど自由に..."
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-bold text-slate-300 transition-colors hover:bg-slate-600"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title}
            className="rounded-xl bg-purple-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-purple-500/20 transition-colors hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            追加する 🎮
          </button>
        </div>
      </form>
    </main>
  );
};

// Link のインポートが必要
import Link from "next/link";

export default Page;
