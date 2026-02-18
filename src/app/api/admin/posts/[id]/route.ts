import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

type RequestBody = {
  title: string;
  content: string;
  coverImageURL: string;
  status: string;
  playTime: number;
  rating: number;
  categoryIds: string[];
};

export const PUT = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const {
      title,
      content,
      coverImageURL,
      status,
      playTime,
      rating,
      categoryIds,
    }: RequestBody = await req.json();

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        coverImageURL,
        status: status as any,
        playTime: playTime ?? 0,
        rating: rating ?? 0,
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const post = await prisma.post.delete({ where: { id } });
    return NextResponse.json({ msg: `「${post.title}」を削除しました` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
};
