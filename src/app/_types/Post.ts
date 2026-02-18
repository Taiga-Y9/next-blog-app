import type { Category } from "./Category";

// ─── ゲームステータス ───────────────────────────────────────────
export type GameStatus = "UNPLAYED" | "PLAYING" | "COMPLETED" | "PERFECT";

// 元の STATUS_MAP と同じ使い方ができるよう emoji / label / color を残す
export const STATUS_MAP: Record<
  GameStatus,
  { label: string; emoji: string; color: string }
> = {
  UNPLAYED: { label: "積みゲー", emoji: "📦", color: "status-gray" },
  PLAYING: { label: "プレイ中", emoji: "🎮", color: "status-blue" },
  COMPLETED: { label: "クリア済み", emoji: "✅", color: "status-green" },
  PERFECT: { label: "100%達成", emoji: "🏆", color: "status-gold" },
};

// ─── プレイ日記（Phase2）──────────────────────────────────────
export type PlayLog = {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Post ─────────────────────────────────────────────────────
export type Post = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  status: GameStatus;
  playTime: number; // 分単位
  rating: number; // 0〜5
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
  playLogs?: PlayLog[];
};
