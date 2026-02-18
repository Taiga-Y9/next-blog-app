"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faGamepad,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLoginError("メールアドレスまたはパスワードが違います");
        return;
      }
      router.replace("/");
    } catch {
      setLoginError("ログイン中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm">
        {/* アイコン & タイトル */}
        <div className="mb-7 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/30">
            <FontAwesomeIcon icon={faGamepad} className="text-3xl text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black text-white">管理者ログイン</h1>
            <p className="mt-1 text-xs text-slate-500">
              ゲームの追加・編集にはログインが必要です
            </p>
          </div>
        </div>

        {/* エラー */}
        {loginError && (
          <div className="mb-4 rounded-xl border border-red-800/50 bg-red-900/30 px-4 py-3 text-sm text-red-400">
            {loginError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={twMerge("space-y-4", isSubmitting && "opacity-50")}
        >
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-300">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-xs text-purple-400"
              />
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-300">
              <FontAwesomeIcon
                icon={faLock}
                className="text-xs text-purple-400"
              />
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className={twMerge(
              "w-full rounded-xl py-3 font-black text-white transition-colors",
              "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500",
              "shadow-lg shadow-purple-500/25",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Page;
