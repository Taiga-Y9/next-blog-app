import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/utils/supabase";

type RequestBody = {
  title: string;
  content: string;
  coverImageURL: string;
  status: string;
  playTime: number;
  rating: number;
  categoryIds: string[];
};

export const POST = async (req: NextRequest) => {
  const token = req.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 401 });

  try {
    const body: RequestBody = await req.json();
    const {
      title,
      content,
      coverImageURL,
      status,
      playTime,
      rating,
      categoryIds,
    } = body;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        coverImageURL,
        status: status as "UNPLAYED" | "PLAYING" | "COMPLETED" | "PERFECT",
        playTime: playTime ?? 0,
        rating: rating ?? 0,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "作成に失敗しました" }, { status: 500 });
  }
};
