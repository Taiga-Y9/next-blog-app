"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

const Page: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();
        const cat = data.find((c: { id: string; name: string }) => c.id === id);
        if (cat) {
          setName(cat.name);
          setOriginalName(cat.name);
        }
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/categories");
    } catch {
      alert("更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${originalName}」を削除しますか？`)) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.push("/admin/categories");
    } catch {
      alert("削除に失敗しました");
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="mt-8 text-center text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
      </div>
    );

  return (
    <main className="pb-10">
      <h1 className="page-title-accent mb-6 text-2xl font-black text-white">
        カテゴリを編集
      </h1>
      <form
        onSubmit={handleSubmit}
        className={twMerge("space-y-4", isSubmitting && "opacity-50")}
      >
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-300">
            カテゴリ名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            required
          />
        </div>
        <div className="flex items-center justify-between">
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
              className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-slate-600"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name}
              className="rounded-xl bg-purple-500 px-6 py-2 text-sm font-bold text-white hover:bg-purple-400 disabled:opacity-40"
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
