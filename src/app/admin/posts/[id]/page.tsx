"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import type { GameStatus } from "@/app/_types/Post";
import { STATUS_MAP } from "@/app/_types/Post";
import Image from "next/image";

type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  status: GameStatus;
  playTime: number;
  rating: number;
  categories: { category: { id: string; name: string } }[];
};

const STATUSES: GameStatus[] = ["UNPLAYED", "PLAYING", "COMPLETED", "PERFECT"];

const Page: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [status, setStatus] = useState<GameStatus>("UNPLAYED");
  const [playTimeH, setPlayTimeH] = useState(0);
  const [playTimeM, setPlayTimeM] = useState(0);
  const [rating, setRating] = useState(0);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [postRes, catsRes] = await Promise.all([
          fetch(`/api/posts/${id}`, { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        if (!postRes.ok) throw new Error("取得失敗");
        const post = (await postRes.json()) as PostApiResponse;
        setTitle(post.title);
        setContent(post.content);
        setCoverImageURL(post.coverImageURL);
        setStatus(post.status);
        setPlayTimeH(Math.floor(post.playTime / 60));
        setPlayTimeM(post.playTime % 60);
        setRating(post.rating);
        setSelectedCategoryIds(post.categories.map((c) => c.category.id));
        if (catsRes.ok) setCategories(await catsRes.json());
      } catch {
        setFetchError("データの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const toggleCategory = (catId: string) =>
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((x) => x !== catId) : [...prev, catId],
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          coverImageURL,
          status,
          playTime: playTimeH * 60 + playTimeM,
          rating,
          categoryIds: selectedCategoryIds,
        }),
      });
      if (!res.ok) throw new Error();
      router.push(`/posts/${id}`);
    } catch {
      alert("更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${title}」を削除しますか？この操作は取り消せません。`))
      return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/");
    } catch {
      alert("削除に失敗しました");
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
  if (fetchError) return <div className="text-red-400">{fetchError}</div>;

  return (
    <main className="pb-10">
      <h1 className="page-title-accent mb-6 text-2xl font-black text-white">
        ✏️ ゲームを編集
      </h1>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-6 py-4 shadow-2xl">
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-purple-400"
            />
            <span className="font-bold text-slate-300">処理中...</span>
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
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-white focus:border-purple-500 focus:outline-none"
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
                      ? "border-purple-400 bg-purple-500 text-white"
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
                  "text-2xl transition-transform hover:scale-110",
                  s <= rating ? "text-amber-400" : "text-slate-700",
                )}
              >
                ★
              </button>
            ))}
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
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
          {coverImageURL && (
            <div className="mt-2 h-24 w-40 overflow-hidden rounded-xl border border-slate-700">
              <Image
                src={coverImageURL}
                alt="preview"
                width={160}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* プラットフォーム/カテゴリ */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-300">
            プラットフォーム / ジャンル
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCategory(c.id)}
                className={twMerge(
                  "rounded-lg border px-3 py-1.5 text-sm font-bold transition-all",
                  selectedCategoryIds.includes(c.id)
                    ? "border-indigo-400 bg-indigo-600 text-white"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* メモ・感想 */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-300">
            メモ・感想
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* ボタン群 */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-xl border border-red-800/50 bg-red-900/30 px-4 py-2 text-sm font-bold text-red-400 transition-colors hover:bg-red-900/50"
          >
            <FontAwesomeIcon icon={faTrash} />
            削除
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold text-slate-300 transition-colors hover:bg-slate-600"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title}
              className="rounded-xl bg-purple-500 px-6 py-2 text-sm font-bold text-white shadow-md shadow-purple-500/20 transition-colors hover:bg-purple-400 disabled:opacity-40"
            >
              更新する
            </button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default Page;
