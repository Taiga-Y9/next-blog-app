"use client";
import type { Post } from "@/app/_types/Post";
import { STATUS_MAP } from "@/app/_types/Post";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import Image from "next/image";

type Props = {
  post: Post;
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <span className="star-rating text-sm">
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
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
};

const GameCard: React.FC<Props> = ({ post }) => {
  const statusInfo = STATUS_MAP[post.status] ?? STATUS_MAP["UNPLAYED"];

  return (
    <div className="game-card overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/80 backdrop-blur">
      <Link href={`/posts/${post.id}`} className="block">
        {/* カバー画像 */}
        <div className="game-cover-wrap relative h-36 bg-gradient-to-br from-indigo-900/60 to-purple-900/60">
          {post.coverImageURL ? (
            <Image
              src={post.coverImageURL}
              alt={post.title}
              width={600}
              height={144}
              className="h-36 w-full object-cover"
            />
          ) : (
            <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-5xl">
              🎮
            </div>
          )}
          {/* ステータスバッジ */}
          <div className="absolute top-2 right-2">
            <span
              className={twMerge("status-badge shadow-md", statusInfo.color)}
            >
              {statusInfo.emoji} {statusInfo.label}
            </span>
          </div>
        </div>

        {/* カード本文 */}
        <div className="p-3">
          {/* タイトル */}
          <div className="mb-2 line-clamp-2 text-sm leading-snug font-black text-white">
            {post.title}
          </div>

          {/* 評価 & プレイ時間 */}
          <div className="flex items-center justify-between">
            <div>
              {post.rating > 0 ? (
                <StarRating rating={post.rating} />
              ) : (
                <span className="text-xs text-slate-600">未評価</span>
              )}
            </div>
            {post.playTime > 0 && (
              <span className="text-xs font-bold text-indigo-400">
                ⏱ {formatPlayTime(post.playTime)}
              </span>
            )}
          </div>

          {/* カテゴリタグ */}
          {post.categories && post.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {post.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-md bg-slate-700/80 px-2 py-0.5 text-xs text-slate-400"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default GameCard;
