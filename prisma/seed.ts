import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  console.log("🗑️  既存データを削除中...");

  // 既存データを削除（リレーション順に注意）
  await prisma.playLog.deleteMany();
  await prisma.postCategory.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();

  console.log("✨ カテゴリを作成中...");

  // プラットフォーム
  const pc = await prisma.category.create({ data: { name: "PC" } });
  const switchPlatform = await prisma.category.create({
    data: { name: "Switch" },
  });
  const ps5 = await prisma.category.create({ data: { name: "PS5" } });
  const steam = await prisma.category.create({ data: { name: "Steam" } });
  const xbox = await prisma.category.create({ data: { name: "Xbox" } });

  // ジャンル
  const rpg = await prisma.category.create({ data: { name: "RPG" } });
  const action = await prisma.category.create({ data: { name: "アクション" } });
  const fps = await prisma.category.create({ data: { name: "FPS" } });
  const adventure = await prisma.category.create({
    data: { name: "アドベンチャー" },
  });
  const simulation = await prisma.category.create({
    data: { name: "シミュレーション" },
  });
  const indie = await prisma.category.create({ data: { name: "インディー" } });

  console.log("🎮 ゲームデータを作成中...");

  // ゲーム1: クリア済み・高評価
  const game1 = await prisma.post.create({
    data: {
      title: "ゼルダの伝説 ティアーズ オブ ザ キングダム",
      content:
        "前作を超える圧倒的なスケール！空島の探索が特に楽しい。クラフト要素が革新的で、自由度が非常に高い。メインストーリーも感動的だった。",
      coverImageURL:
        "https://placehold.jp/24/4a90e2/ffffff/600x337.png?text=Zelda+TotK",
      status: "COMPLETED",
      playTime: 7200, // 120時間
      rating: 5,
      categories: {
        create: [
          { categoryId: switchPlatform.id },
          { categoryId: rpg.id },
          { categoryId: action.id },
        ],
      },
    },
  });

  await prisma.playLog.create({
    data: {
      postId: game1.id,
      content: "ガノンドロフ戦、めちゃくちゃ熱かった！BGMが最高すぎる。",
    },
  });

  await prisma.playLog.create({
    data: {
      postId: game1.id,
      content: "空島探索が楽しすぎて本編そっちのけで遊んでた。",
    },
  });

  // ゲーム2: プレイ中
  const game2 = await prisma.post.create({
    data: {
      title: "Elden Ring",
      content:
        "難しいけどやめられない。ボス戦が特に熱い。オープンワールドの探索が楽しくて寄り道ばかりしてる。",
      coverImageURL:
        "https://placehold.jp/24/7b68ee/ffffff/600x337.png?text=Elden+Ring",
      status: "PLAYING",
      playTime: 4200, // 70時間
      rating: 5,
      categories: {
        create: [
          { categoryId: ps5.id },
          { categoryId: pc.id },
          { categoryId: action.id },
          { categoryId: rpg.id },
        ],
      },
    },
  });

  await prisma.playLog.create({
    data: {
      postId: game2.id,
      content: "マレニア倒した！30回くらい死んだけど達成感がすごい。",
    },
  });

  // ゲーム3: 積みゲー
  await prisma.post.create({
    data: {
      title: "Hollow Knight",
      content: "評判良いので購入。いつかやる。",
      coverImageURL:
        "https://placehold.jp/24/48d597/ffffff/600x337.png?text=Hollow+Knight",
      status: "UNPLAYED",
      playTime: 0,
      rating: 0,
      categories: {
        create: [
          { categoryId: steam.id },
          { categoryId: switchPlatform.id },
          { categoryId: action.id },
          { categoryId: indie.id },
        ],
      },
    },
  });

  // ゲーム4: 100%達成
  const game4 = await prisma.post.create({
    data: {
      title: "Hades",
      content:
        "ローグライク最高傑作。キャラクターも魅力的でストーリーも良い。全実績解除まで遊んだ。",
      coverImageURL:
        "https://placehold.jp/24/e74c3c/ffffff/600x337.png?text=Hades",
      status: "PERFECT",
      playTime: 5400, // 90時間
      rating: 5,
      categories: {
        create: [
          { categoryId: pc.id },
          { categoryId: switchPlatform.id },
          { categoryId: action.id },
          { categoryId: indie.id },
        ],
      },
    },
  });

  await prisma.playLog.create({
    data: {
      postId: game4.id,
      content: "やっと全実績コンプ！エピローグ見れて満足。",
    },
  });

  // ゲーム5: 積みゲー
  await prisma.post.create({
    data: {
      title: "Stardew Valley",
      content: "Steamセールで購入。農場ゲーム。",
      coverImageURL:
        "https://placehold.jp/24/95a5a6/ffffff/600x337.png?text=Stardew+Valley",
      status: "UNPLAYED",
      playTime: 0,
      rating: 0,
      categories: {
        create: [
          { categoryId: pc.id },
          { categoryId: simulation.id },
          { categoryId: indie.id },
        ],
      },
    },
  });

  // ゲーム6: プレイ中・FPS
  const game6 = await prisma.post.create({
    data: {
      title: "VALORANT",
      content: "ランクマ頑張ってる。エイム練習も毎日やってる。",
      coverImageURL:
        "https://placehold.jp/24/ff4655/ffffff/600x337.png?text=VALORANT",
      status: "PLAYING",
      playTime: 12000, // 200時間
      rating: 4,
      categories: {
        create: [{ categoryId: pc.id }, { categoryId: fps.id }],
      },
    },
  });

  await prisma.playLog.create({
    data: {
      postId: game6.id,
      content: "ダイヤ昇格した！やっと這い上がれた。",
    },
  });

  await prisma.playLog.create({
    data: {
      postId: game6.id,
      content: "今日は調子悪かった。連敗しすぎ...明日頑張る。",
    },
  });

  // ゲーム7: 積みゲー
  await prisma.post.create({
    data: {
      title: "The Witcher 3",
      content: "ずっと気になってた。いつか絶対やる。",
      coverImageURL:
        "https://placehold.jp/24/34495e/ffffff/600x337.png?text=Witcher+3",
      status: "UNPLAYED",
      playTime: 0,
      rating: 0,
      categories: {
        create: [
          { categoryId: pc.id },
          { categoryId: ps5.id },
          { categoryId: rpg.id },
          { categoryId: action.id },
        ],
      },
    },
  });

  // ゲーム8: クリア済み
  await prisma.post.create({
    data: {
      title: "Ghost of Tsushima",
      content:
        "和風オープンワールド最高。グラフィックが美しい。戦闘も爽快で楽しかった。",
      coverImageURL:
        "https://placehold.jp/24/c0392b/ffffff/600x337.png?text=Ghost+of+Tsushima",
      status: "COMPLETED",
      playTime: 3600, // 60時間
      rating: 5,
      categories: {
        create: [
          { categoryId: ps5.id },
          { categoryId: action.id },
          { categoryId: adventure.id },
        ],
      },
    },
  });

  // ゲーム9: 積みゲー
  await prisma.post.create({
    data: {
      title: "Celeste",
      content: "難しいらしいけど評判が良い。インディーの名作。",
      coverImageURL:
        "https://placehold.jp/24/9b59b6/ffffff/600x337.png?text=Celeste",
      status: "UNPLAYED",
      playTime: 0,
      rating: 0,
      categories: {
        create: [
          { categoryId: pc.id },
          { categoryId: switchPlatform.id },
          { categoryId: action.id },
          { categoryId: indie.id },
        ],
      },
    },
  });

  // ゲーム10: プレイ中
  await prisma.post.create({
    data: {
      title: "Baldur's Gate 3",
      content:
        "RPG好きなら絶対やるべき。選択肢が多くて毎回悩む。キャラクターとの会話が楽しい。",
      coverImageURL:
        "https://placehold.jp/24/27ae60/ffffff/600x337.png?text=BG3",
      status: "PLAYING",
      playTime: 4800, // 80時間
      rating: 5,
      categories: {
        create: [{ categoryId: pc.id }, { categoryId: rpg.id }],
      },
    },
  });

  console.log("✅ シードデータの投入が完了しました！");
  console.log("📊 作成されたデータ:");
  console.log("   - カテゴリ: 11個");
  console.log("   - ゲーム: 10本");
  console.log("   - プレイ日記: 6件");
};

main()
  .catch((e) => {
    console.error("❌ エラーが発生しました:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
