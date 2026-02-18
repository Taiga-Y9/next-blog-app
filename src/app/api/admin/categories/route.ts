import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { name } = await req.json();
    const category = await prisma.category.create({ data: { name } });
    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの作成に失敗しました" },
      { status: 500 },
    );
  }
};
