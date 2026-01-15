import type { Category } from "./Category";
import type { CoverImage } from "./CoverImage";

export type Post = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string; // 変更
  createdAt: string;
  updatedAt: string; // 追加
  categories?: Category[]; // オプショナルに（一覧取得時には含まれない）
};
