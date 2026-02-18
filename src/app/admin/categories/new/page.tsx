"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

const Page: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/categories");
    } catch {
      alert("作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pb-10">
      <h1 className="page-title-accent mb-6 text-2xl font-black text-white">
        カテゴリを追加
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
            placeholder="例: Nintendo Switch, PS5, Steam, RPG, FPS..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
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
            追加する
          </button>
        </div>
      </form>
    </main>
  );
};

export default Page;
