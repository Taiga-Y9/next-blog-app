"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Post, PlayLog } from "@/app/_types/Post";
import { STATUS_MAP } from "@/app/_types/Post";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faArrowLeft,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import Link from "next/link";
import { useAuth } from "@/app/_hooks/useAuth";

type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  status: string;
  rating: number;
  playTime: number;
  createdAt: string;
  updatedAt: string;
  categories: { category: { id: string; name: string } }[];
  playLogs: PlayLog[];
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <span className="text-xl">
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        className={s <= rating ? "text-amber-400" : "text-slate-600"}
      >
        ★
      </span>
    ))}
  </span>
);

const formatPlayTime = (minutes: number): string => {
  if (minutes === 0) return "未記録";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
};

const Page: React.FC = () => {
  const [post, setPost] = useState<PostApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { id } = useParams() as { id: string };
  const { session, token } = useAuth();

  // プレイ日記フォーム
  const [logContent, setLogContent] = useState("");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("データの取得に失敗しました");
      setPost(await res.json());
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logContent.trim() || !token) return;
    setIsSubmittingLog(true);
    try {
      const res = await fetch("/api/play-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ postId: id, content: logContent }),
      });
      if (!res.ok) throw new Error("投稿失敗");
      setLogContent("");
      await fetchPost();
    } catch {
      alert("日記の投稿に失敗しました");
    } finally {
      setIsSubmittingLog(false);
    }
  };

  if (fetchError) return <div className="mt-4 text-red-400">{fetchError}</div>;

  if (isLoading)
    return (
      <div className="mt-8 text-center text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
        Loading...
      </div>
    );

  if (!post)
    return (
      <div className="mt-4 text-slate-400">
        指定されたゲームが見つかりませんでした。
      </div>
    );

  const safeHTML = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
  });

  const statusInfo =
    STATUS_MAP[post.status as keyof typeof STATUS_MAP] ??
    STATUS_MAP["UNPLAYED"];

  const sortedLogs = (post.playLogs ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <main className="pb-10">
      {/* 戻るボタン */}
      <Link
        href="/"
        className="mt-3 mb-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        ライブラリに戻る
      </Link>

      {/* カバー画像 */}
      <div className="game-cover-wrap mb-5 overflow-hidden rounded-2xl shadow-xl shadow-black/30">
        {post.coverImageURL ? (
          <Image
            src={post.coverImageURL}
            alt={post.title}
            width={1365}
            height={400}
            priority
            className="max-h-56 w-full object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-6xl">
            🎮
          </div>
        )}
      </div>

      {/* タイトル & ステータス */}
      <div className="mb-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h1 className="text-2xl leading-tight font-black text-white">
            {post.title}
          </h1>
          <span
            className={twMerge("status-badge mt-1 shrink-0", statusInfo.color)}
          >
            {statusInfo.emoji} {statusInfo.label}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          登録日: {dayjs(post.createdAt).format("YYYY/MM/DD")}
        </div>
      </div>

      {/* 情報カード群 */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {/* プレイ時間 */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-3">
          <div className="mb-1 text-xs font-semibold text-slate-400">
            ⏱ プレイ時間
          </div>
          <div className="font-black text-indigo-300">
            {formatPlayTime(post.playTime)}
          </div>
        </div>
        {/* 評価 */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-3">
          <div className="mb-1 text-xs font-semibold text-slate-400">評価</div>
          {post.rating > 0 ? (
            <StarRating rating={post.rating} />
          ) : (
            <span className="text-sm text-slate-600">未評価</span>
          )}
        </div>
      </div>

      {/* カテゴリ */}
      {post.categories && post.categories.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {post.categories.map((c) => (
            <span
              key={c.category.id}
              className="rounded-full border border-slate-600/50 bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300"
            >
              # {c.category.name}
            </span>
          ))}
        </div>
      )}

      {/* メモ・感想 */}
      {post.content && (
        <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4 shadow-sm">
          <div className="mb-2 text-sm font-bold text-slate-400">
            📝 メモ・感想
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: safeHTML }}
            className="text-sm leading-relaxed text-slate-300"
          />
        </div>
      )}

      {/* 管理者リンク */}
      {session && (
        <div className="mb-6">
          <Link
            href={`/admin/posts/${post.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-700/50 bg-purple-900/20 px-3 py-1.5 text-sm font-bold text-purple-400 transition-colors hover:bg-purple-900/40 hover:text-purple-300"
          >
            ✏️ このゲームを編集
          </Link>
        </div>
      )}

      {/* ─── プレイ日記（Phase2）──────────────────────────── */}
      <section>
        <h2 className="page-title-accent mb-4 flex items-center gap-2 text-lg font-black text-white">
          <FontAwesomeIcon
            icon={faBookOpen}
            className="text-base text-purple-400"
          />
          プレイ日記
        </h2>

        {/* 投稿フォーム（ログイン時のみ） */}
        {session && (
          <form onSubmit={handleAddLog} className="mb-5">
            <textarea
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              rows={3}
              placeholder="今日のプレイ記録をサクッと残そう ✍️&#10;「ラスボス倒した！感動した」「今日も積んだ」など気軽に！"
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingLog || !logContent.trim()}
                className={twMerge(
                  "rounded-xl px-4 py-1.5 text-sm font-bold transition-colors",
                  "bg-purple-500 text-white shadow-md shadow-purple-500/20 hover:bg-purple-400",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {isSubmittingLog ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                  "投稿する"
                )}
              </button>
            </div>
          </form>
        )}

        {/* 日記一覧 */}
        {sortedLogs.length > 0 ? (
          <div className="space-y-3">
            {sortedLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-3"
              >
                <div className="mb-1.5 text-xs text-slate-500">
                  {dayjs(log.createdAt).format("YYYY/MM/DD HH:mm")}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                  {log.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700 py-10 text-center text-sm text-slate-600">
            まだ日記がありません
            {session && (
              <div className="mt-1 text-xs text-slate-700">
                ↑ 上のフォームから投稿しよう！
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Page;
