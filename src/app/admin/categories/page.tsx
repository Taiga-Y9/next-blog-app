"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

type Category = { id: string; name: string; _count: { posts: number } };

const Page: React.FC = () => {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setCategories(await res.json());
    } catch {
      setFetchError("取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string, count: number) => {
    const msg =
      count > 0
        ? `「${name}」は${count}本のゲームで使用中です。削除しますか？`
        : `「${name}」を削除しますか？`;
    if (!confirm(msg)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      await fetchCategories();
    } catch {
      alert("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (isLoading)
    return (
      <div className="mt-8 text-center text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
        Loading...
      </div>
    );
  if (!categories) return <div className="text-red-400">{fetchError}</div>;

  return (
    <main className="pb-10">
      <div className="mt-2 mb-5 flex items-center justify-between">
        <h1 className="page-title-accent text-2xl font-black text-white">
          カテゴリ管理
        </h1>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-1.5 rounded-xl bg-purple-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-purple-500/20 transition-colors hover:bg-purple-400"
        >
          <FontAwesomeIcon icon={faPlus} />
          追加
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          カテゴリがまだありません
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-2xl border border-slate-700/50 bg-slate-800/60 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-black text-white">{cat.name}</span>
                <span
                  className={twMerge(
                    "rounded-full px-2.5 py-0.5 text-xs font-bold",
                    cat._count.posts > 0
                      ? "border border-indigo-700/50 bg-indigo-900/60 text-indigo-300"
                      : "bg-slate-700 text-slate-500",
                  )}
                >
                  {cat._count.posts}本
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/categories/${cat.id}`}
                  className="rounded-xl bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-600"
                >
                  編集
                </Link>
                <button
                  onClick={() =>
                    handleDelete(cat.id, cat.name, cat._count.posts)
                  }
                  disabled={deletingId === cat.id}
                  className={twMerge(
                    "rounded-xl px-3 py-1.5 text-xs font-bold transition-colors",
                    "border border-red-800/50 bg-red-900/40 text-red-400 hover:bg-red-900/70",
                    deletingId === cat.id && "opacity-50",
                  )}
                >
                  {deletingId === cat.id ? (
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
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;
