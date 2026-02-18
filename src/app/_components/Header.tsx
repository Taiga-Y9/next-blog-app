"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad, faPlus, faList } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/app/_hooks/useAuth";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

const Header: React.FC = () => {
  const router = useRouter();
  const { isLoading, session } = useAuth();

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/50 bg-slate-900/95 shadow-lg shadow-black/30 backdrop-blur">
      <div className="mx-4 max-w-3xl py-3 md:mx-auto">
        <div className="flex items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md shadow-purple-500/30 transition-transform duration-200 group-hover:scale-110">
              <FontAwesomeIcon
                icon={faGamepad}
                className="text-base text-white"
              />
            </div>
            <div>
              <span className="text-base font-black tracking-wider text-white">
                GameLib
              </span>
              <div className="-mt-0.5 text-[10px] font-medium text-slate-500">
                マイゲームライブラリ
              </div>
            </div>
          </Link>

          {/* 右側ボタン群 */}
          <div className="flex items-center gap-2">
            {/* ▼ ログイン中のみ表示: 投稿ボタン ＆ 管理ボタン */}
            {!isLoading && session && (
              <>
                <Link
                  href="/admin/posts/new"
                  className={twMerge(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold",
                    "bg-purple-500 text-white transition-colors hover:bg-purple-400",
                    "shadow-md shadow-purple-500/25",
                  )}
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                  投稿
                </Link>
                <Link
                  href="/admin/posts"
                  className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-bold text-slate-300 transition-colors hover:bg-slate-600"
                >
                  <FontAwesomeIcon icon={faList} className="text-xs" />
                  管理
                </Link>
              </>
            )}

            {/* ログイン / ログアウト */}
            {!isLoading &&
              (session ? (
                <button
                  onClick={logout}
                  className="px-1 text-xs text-slate-500 transition-colors hover:text-slate-300"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-1 text-xs text-slate-500 transition-colors hover:text-slate-300"
                >
                  Login
                </Link>
              ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
