import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/utils/supabase";

export const POST = async (req: NextRequest) => {
  // 認証チェック
  const token = req.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);
  if (error)
    return NextResponse.json({ error: "認証エラー" }, { status: 401 });

  try {
    const { postId, content } = await req.json();
    if (!postId || !content?.trim())
      return NextResponse.json(
        { error: "postId と content は必須です" },
        { status: 400 },
      );

    const log = await prisma.playLog.create({
      data: { postId, content: content.trim() },
    });
    return NextResponse.json(log);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "日記の投稿に失敗しました" }, { status: 500 });
  }
};
