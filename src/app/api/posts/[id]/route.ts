import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        coverImageURL: true,
        status: true,
        playTime: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          select: { category: { select: { id: true, name: true } } },
        },
        playLogs: {
          select: {
            id: true,
            postId: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post)
      return NextResponse.json(
        { error: "ゲームが見つかりません" },
        { status: 404 },
      );

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
};
