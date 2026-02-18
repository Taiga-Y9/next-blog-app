import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (_req: NextRequest) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの取得に失敗しました" },
      { status: 500 },
    );
  }
};
