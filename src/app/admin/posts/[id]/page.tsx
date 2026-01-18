"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTrash,
  faEye,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useRouter, useParams } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import dayjs from "dayjs";

type Category = {
  id: string;
  name: string;
};

type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  createdAt: string;
  updatedAt: string;
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
};

const Page: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [post, setPost] = useState<PostApiResponse | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // プレビュー表示切り替え用State
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const fetchCategories = async () => {
    try {
      const requestUrl = "/api/categories";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const apiResBody = await res.json();
      setCategories(apiResBody);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの一覧のフェッチに失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    }
  };

  const fetchPost = async () => {
    try {
      const requestUrl = `/api/posts/${id}`;
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const apiResBody = (await res.json()) as PostApiResponse;
      setPost(apiResBody);
      setTitle(apiResBody.title);
      setContent(apiResBody.content);
      setCoverImageURL(apiResBody.coverImageURL);
      setSelectedCategoryIds(apiResBody.categories.map((c) => c.category.id));
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事のフェッチに失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCategories(), fetchPost()]);
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestBody = JSON.stringify({
        title,
        content,
        coverImageURL,
        categoryIds: selectedCategoryIds,
      });

      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      alert("投稿記事を更新しました");
      router.push("/admin/posts");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事の更新に失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました`;
      console.error(errorMsg);
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${post?.title}」を削除しますか？`)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      alert("削除しました");
      router.push("/admin/posts");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `削除に失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました`;
      console.error(errorMsg);
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!categories || !post) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  const safeHTML = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
  });

  const selectedCategories = categories.filter((cat) =>
    selectedCategoryIds.includes(cat.id),
  );

  const dtFmt = "YYYY-MM-DD";

  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xl font-bold">投稿記事の編集</div>

        {/* 編集/プレビュー切り替えタブ */}
        <div className="flex rounded-md border border-slate-300">
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className={twMerge(
              "px-4 py-2 text-sm font-bold",
              !isPreviewMode
                ? "bg-indigo-500 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100",
            )}
          >
            <FontAwesomeIcon icon={faEdit} className="mr-1" />
            編集
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewMode(true)}
            className={twMerge(
              "px-4 py-2 text-sm font-bold",
              isPreviewMode
                ? "bg-indigo-500 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100",
            )}
          >
            <FontAwesomeIcon icon={faEye} className="mr-1" />
            プレビュー
          </button>
        </div>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="mr-2 animate-spin text-gray-500"
            />
            <div className="flex items-center text-gray-500">処理中...</div>
          </div>
        </div>
      )}

      {/* 編集モード */}
      {!isPreviewMode ? (
        <form
          onSubmit={handleSubmit}
          className={twMerge("space-y-4", isSubmitting && "opacity-50")}
        >
          <div className="space-y-1">
            <label htmlFor="title" className="block font-bold">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full rounded-md border-2 px-2 py-1"
              placeholder="投稿記事のタイトルを記入してください"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="content" className="block font-bold">
              本文
            </label>
            <textarea
              id="content"
              name="content"
              className="w-full rounded-md border-2 px-2 py-1"
              placeholder="投稿記事の本文を記入してください"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
            />
            <div className="text-sm text-gray-600">
              ※ 使用可能なHTMLタグ: &lt;b&gt;, &lt;strong&gt;, &lt;i&gt;,
              &lt;em&gt;, &lt;u&gt;, &lt;br&gt;
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="coverImageURL" className="block font-bold">
              カバー画像URL
            </label>
            <input
              type="url"
              id="coverImageURL"
              name="coverImageURL"
              className="w-full rounded-md border-2 px-2 py-1"
              placeholder="https://example.com/image.jpg"
              value={coverImageURL}
              onChange={(e) => setCoverImageURL(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold">カテゴリ</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={twMerge(
                    "cursor-pointer rounded-md border-2 px-3 py-1.5",
                    selectedCategoryIds.includes(category.id)
                      ? "border-indigo-500 bg-indigo-100 text-indigo-700"
                      : "border-slate-300 bg-white text-slate-700",
                  )}
                >
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className={twMerge(
                "rounded-md px-5 py-1 font-bold",
                "bg-red-500 text-white hover:bg-red-600",
                isSubmitting && "opacity-50",
              )}
            >
              <FontAwesomeIcon icon={faTrash} className="mr-1" />
              削除
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => router.back()}
                className={twMerge(
                  "rounded-md px-5 py-1 font-bold",
                  "bg-gray-300 text-gray-700 hover:bg-gray-400",
                )}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={twMerge(
                  "rounded-md px-5 py-1 font-bold",
                  "bg-indigo-500 text-white hover:bg-indigo-600",
                  isSubmitting && "opacity-50",
                )}
              >
                更新
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* プレビューモード */
        <div className="rounded-lg border-2 border-indigo-300 bg-white p-6">
          <div className="mb-4 rounded-md bg-indigo-50 p-3 text-sm text-indigo-700">
            <FontAwesomeIcon icon={faEye} className="mr-1" />
            プレビューモード - 実際の表示イメージを確認できます
          </div>

          <div className="space-y-3">
            <div className="text-2xl font-bold">
              {title || "（タイトル未入力）"}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>投稿日: {dayjs(post.createdAt).format(dtFmt)}</div>
              <div className="flex space-x-1.5">
                {selectedCategories.length > 0 ? (
                  selectedCategories.map((category) => (
                    <div
                      key={category.id}
                      className={twMerge(
                        "rounded-md px-2 py-0.5",
                        "text-xs font-bold",
                        "border border-slate-400 text-slate-500",
                      )}
                    >
                      {category.name}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400">
                    （カテゴリ未選択）
                  </div>
                )}
              </div>
            </div>

            <div>
              {coverImageURL ? (
                <Image
                  src={coverImageURL}
                  alt={title}
                  width={1365}
                  height={768}
                  className="rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-xl bg-gray-200 text-gray-500">
                  （カバー画像URL未入力）
                </div>
              )}
            </div>

            <div
              dangerouslySetInnerHTML={{ __html: safeHTML }}
              className="prose max-w-none"
            />

            {!content && <div className="text-gray-400">（本文未入力）</div>}
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
