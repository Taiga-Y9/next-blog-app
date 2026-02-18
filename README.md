# 🎮 GameLib - マイゲームライブラリ

ブログアプリをベースにした、個人用ゲームライブラリ管理システムです。

## ✨ 主な機能

### Phase 1: 基本機能
- ✅ ゲームステータス管理（積みゲー / プレイ中 / クリア済み / 100%達成）
- ✅ プレイ時間記録（時間・分単位）
- ✅ 星評価（0〜5）
- ✅ カバー画像・メモ
- ✅ プラットフォーム/ジャンル分類

### Phase 2: プレイ日記
- ✅ ゲームごとにプレイ日記を投稿
- ✅ 時系列表示
- ✅ 管理者のみ投稿可能

### 統計ダッシュボード
- ✅ 総ゲーム数 / プレイ中 / 積みゲー / 総プレイ時間
- ✅ 積みゲー警告（5本以上で表示）
- ✅ クリア率計算

### その他
- ✅ ステータスタブでフィルタリング
- ✅ 検索機能
- ✅ カテゴリフィルター
- ✅ 管理者認証（ログイン時のみ投稿・編集可能）

---

## 📂 ファイル構成

```
project-root/
├── prisma/
│   └── schema.prisma              # GameStatus/PlayLog追加
│
├── src/
│   ├── app/
│   │   ├── _components/
│   │   │   ├── Header.tsx         # ログイン時に「投稿」ボタン表示
│   │   │   ├── GameCard.tsx       # ゲームカード
│   │   │   └── PostSummary.tsx    # （GameCardと同じ）
│   │   │
│   │   ├── _types/
│   │   │   └── Post.ts            # GameStatus/PlayLog型追加
│   │   │
│   │   ├── admin/                 # 管理画面
│   │   ├── api/                   # APIルート
│   │   │   └── play-logs/         # 🆕 プレイ日記API
│   │   ├── posts/[id]/            # ゲーム詳細＋プレイ日記
│   │   ├── login/                 # ログイン
│   │   │
│   │   ├── globals.css            # ダークテーマカスタムクラス
│   │   ├── layout.tsx             # GameLib タイトル
│   │   └── page.tsx               # トップ（統計＋タブ＋検索）
│   │
│   ├── lib/prisma.ts
│   └── utils/supabase.ts
│
├── next.config.ts
└── README.md
```

---

## 🚀 セットアップ手順

### 1. ファイルの配置

ダウンロードしたファイルをプロジェクトルートに配置してください。

```bash
# 既存のブログアプリのバックアップを取る（推奨）
cp -r your-blog-app your-blog-app-backup

# ダウンロードしたファイルを上書き
# （outputs/ の中身をプロジェクトルートにコピー）
```

### 2. データベースの更新

```bash
# スキーマをデータベースに反映
npx prisma db push

# Prisma Clientを再生成
npx prisma generate
```

### 3. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 にアクセスしてください。

---

## 🔑 初回ログイン

管理者としてログインするには、Supabase の Authentication でユーザーを作成してください。

1. Supabase ダッシュボード → Authentication → Users → Add User
2. メールアドレスとパスワードを設定
3. アプリの `/login` からログイン

---

## 📝 元のブログアプリからの変更点

### データベース（schema.prisma）

```prisma
// 追加された列
model Post {
  status        GameStatus     @default(UNPLAYED)
  playTime      Int            @default(0)   // 分単位
  rating        Int            @default(0)   // 0〜5
  playLogs      PlayLog[]                    // 🆕 リレーション
}

// 🆕 新規テーブル
model PlayLog {
  id        String   @id @default(uuid())
  postId    String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  post      Post     @relation(...)
}
```

### フロントエンド

| ファイル | 変更内容 |
|---|---|
| `globals.css` | ダークテーマ用カスタムクラス追加 |
| `layout.tsx` | タイトルを「GameLib」に変更 |
| `Header.tsx` | ログイン時に「投稿」ボタンを表示 |
| `page.tsx` | 統計ダッシュボード・ステータスタブ・検索追加 |
| `posts/[id]/page.tsx` | プレイ日記セクション追加 |
| `admin/posts/*` | status/playTime/rating フィールド追加 |
| `_components/GameCard.tsx` | 🆕 ゲームカード（PostSummaryと同一） |

### API

| エンドポイント | 変更 |
|---|---|
| `GET /api/posts` | status/playTime/rating を返す |
| `GET /api/posts/[id]` | playLogs も含めて返す |
| `POST /api/admin/posts` | status/playTime/rating を受け取る |
| `PUT /api/admin/posts/[id]` | status/playTime/rating を更新 |
| `POST /api/play-logs` | 🆕 プレイ日記投稿 |

---

## 🎨 デザイン

- **カラースキーム**: ダークモード（slate-900 ベース）
- **アクセントカラー**: Purple / Indigo
- **フォント**: システムデフォルト
- **コンポーネント**: ラウンド角 (rounded-xl/2xl) + グラデーション

---

## 📌 今後の拡張案（Phase 3）

- [ ] 積みゲールーレット
- [ ] 週間プレイ時間グラフ
- [ ] ゲームごとのスクリーンショット追加
- [ ] 他ユーザーとの共有機能

---

## ⚠️ 注意事項

- このアプリは**個人用**として設計されています
- 認証はSupabase Authを使用（管理者1名想定）
- プレイ日記は管理者のみ投稿可能
- 環境変数（.env）は既存のものをそのまま使用

---

## 🛠 トラブルシューティング

### エラー: `Module not found: Can't resolve '@/generated/prisma/client'`

```bash
npx prisma generate
```

### エラー: `Unknown column 'status'`

```bash
npx prisma db push
```

### ログインできない

Supabase ダッシュボードでユーザーが作成されているか確認してください。

---

以上です！ 🎮
