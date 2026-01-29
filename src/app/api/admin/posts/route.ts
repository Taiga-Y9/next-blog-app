import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import type { Post } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { supabase } from "@/utils/supabase";

type RequestBody = {
  title: string;
  content: string;
  coverImageURL: string;
  categoryIds: string[];
};

export const POST = async (req: NextRequest) => {
  // JWTトークンの検証・認証 (失敗したら 401 Unauthorized を返す)
  const token = req.headers.get("Authorization") ?? "";
  const { data, error } = await supabase.auth.getUser(token);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 401 });

  try {
    const requestBody: RequestBody = await req.json();
    const { title, content, coverImageURL, categoryIds } = requestBody;

    // 新規投稿記事を作成
    const post: Post = await prisma.post.create({
      data: {
        title,
        content,
        coverImageURL,
        categories: {
          create: categoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);

    // 外部キー制約違反のエラーをキャッチ
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "指定されたカテゴリの一部が存在しません" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "投稿記事の作成に失敗しました" },
      { status: 500 },
    );
  }
};
