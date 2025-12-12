# Rails React Boilerplate Template

Rails 8.0 + React Router 7（SPAモード）のフルスタックWebアプリケーションテンプレート

## 🚀 技術構成

### Backend (Rails API)
- **Ruby**: 3.4.5
- **Rails**: 8.0.2
- **Database**: PostgreSQL
- **Cache/Session**: Redis（Solid Cache, Solid Queue, Solid Cable）
- **Web Server**: Puma + Thruster
- **API仕様**: OpenAPI 3.0
- **テスト**: RSpec + FactoryBot + Committee

### Frontend (React SPA)
- **Node.js**: 22系
- **Package Manager**: pnpm
- **Framework**: React
- **Router**: React Router v7 (SPAモード)
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Language**: TypeScript
- **State Management**: SWR
- **API Client**: Orval（OpenAPIから自動生成）
- **テスト**: Vitest + Testing Library + MSW

### API開発
- **スキーマ駆動開発**: OpenAPI → TypeScriptクライアント自動生成
- **型安全**: OpenAPI → Orval → SWR統合
- **モック**: MSW（開発・テスト用）

## 📁 プロジェクト構成

```
rails-react-boiler-template/
├── app/                      # Rails API
│   ├── controllers/         # APIコントローラー
│   └── models/             # データモデル
├── frontend/                # React SPA
│   ├── app/                # React Routerアプリケーション
│   │   ├── components/     # UIコンポーネント（shadcn/ui）
│   │   ├── core/           # UIコンポーネント
│   │   ├── gen/           # 自動生成APIクライアント
│   │   ├── hooks/         # カスタムhook
│   │   ├── lib/           # ユーティリティ
│   │   └── routes/        # ページコンポーネント
│   └── spec/              # フロントエンドテスト
├── openapi/                # OpenAPIスキーマ
│   ├── resources/         # エンドポイント定義
│   └── merged/            # 生成されたマージ版
├── spec/                   # Railsテスト
└── public/frontend/        # ビルド済みSPAアセット
```

## 🛠 環境構築

### システム要件
- Docker & Docker Compose
- rbenv (Ruby環境管理)
- nodenv (Node.js環境管理) 
- corepack (pnpm管理用)

### rbenvとnodenvのインストール

#### macOS (Homebrew)
```bash
# rbenv
brew install rbenv ruby-build

# nodenv  
brew install nodenv node-build
```

#### セットアップ後にシェル設定を追加
```bash
# ~/.zshrc または ~/.bashrc に追加
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
echo 'eval "$(nodenv init -)"' >> ~/.zshrc
source ~/.zshrc
```

## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd rails-react-boiler-template
```

### 2. Ruby環境のセットアップ
```bash
# Ruby 3.4.5をインストール
rbenv install 3.4.5
rbenv local 3.4.5

# Bundlerでgemをインストール
bundle install
```

### 3. Node.js環境のセットアップ
```bash
# Node.js 22.18.0をインストール
nodenv install 22.18.0
nodenv local 22.18.0

# corepackを有効化してpnpmを使用
corepack enable pnpm

# 依存関係をインストール
pnpm install
```

### 4. Dockerサービスの起動
```bash
# PostgreSQLとRedisを起動
docker compose up -d postgres redis
```

### 5. データベースのセットアップ
```bash
# データベースの作成とマイグレーション
rails db:create
rails db:migrate
rails db:seed
```

### 6. フロントエンドのビルド
```bash
# フロントエンドビルド & Rails用アセット配信
rails react_router:build
```

### 7. API クライアントの生成
```bash
# OpenAPI仕様からAPI クライアントを生成（pnpm orvalも自動実行）
bin/openapi-generate
```

## 🚀 実装手順

### 1. OpenAPI定義 → Rails API実装
```bash
# 1. OpenAPIスキーマを定義

# 2. マージ版生成 & TypeScriptクライアント生成
bin/openapi-generate

# 3. Railsコントローラー・モデル実装
rails generate controller Api::Users
# app/controllers/api/users_controller.rb を実装

# 4. APIテスト実行
bundle exec rspec spec/requests/
```

### 2. フロントエンド実装 → ビルド
```bash
# 1. Reactコンポーネント実装
# frontend/app/routes/ にページを追加
# frontend/app/core/ にコンポーネントを追加

# 2. 自動生成されたAPIクライアントを使用
# frontend/app/gen/api-client/ の hooks を利用

# 3. フロントエンドテスト
cd frontend
pnpm test

# 4. ビルド & Railsへ配信（pnpm run buildも自動実行）
rails react_router:build
```

## 🔧 開発環境の起動

### 1. Dockerサービスの起動
```bash
docker compose up -d
```

### 2. Railsサーバーの起動
```bash
# ターミナル1: Rails APIサーバー (ポート3000)
rails server
```

### 3. フロントエンド開発サーバーの起動
```bash
# ターミナル2: Vite開発サーバー (ポート5173)
cd frontend
pnpm run dev
```

## 開発時の重要な注意点

### API Proxy設定

開発環境では、フロントエンド(Vite: ポート5173)とバックエンド(Rails: ポート3000)が異なるポートで動作します。
CORS問題を回避するため、Viteの開発サーバーは`/api`で始まるリクエストをRailsサーバーにプロキシします。

#### proxy設定の仕組み
```typescript
// frontend/vite.config.ts
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3000",
      rewrite: (path) => path.replace(/^\/api/, "")
    }
  }
}
```

#### APIの呼び出し方法
```typescript
// フロントエンドから Rails APIを呼び出す場合
// 実際のRailsルート: GET /posts
// フロントエンドから: GET /api/posts (自動的に /posts にリライトされる)

fetch('/api/posts')
  .then(response => response.json())
  .then(data => console.log(data));
```

**重要**: この proxy設定は**開発環境でのみ**動作します。本番環境では同一オリジンからの配信となるため、プロキシは不要です。

### アセット配信について

- **開発環境**: フロントエンドアセットはVite(5173)から配信
- **本番環境**: フロントエンドアセットはRails(3000/80)から配信

## 🧪 テスト環境

### Railsテスト
```bash
# 全テスト実行
bundle exec rspec

# APIテスト（リクエストテスト）
bundle exec rspec spec/requests/

# モデルテスト
bundle exec rspec spec/models/

# 特定のファイルをテスト
bundle exec rspec spec/models/user_spec.rb
```

### フロントエンドテスト
```bash
cd frontend

# 全テスト実行
pnpm test

# テストウォッチモード
pnpm test:watch

# テストUI（ブラウザで確認）
pnpm test:ui

# 型チェック
pnpm typecheck
```

### Linting & Formatting
```bash
# Rails側
bundle exec rubocop -A  # 自動修正
bin/brakeman           # セキュリティチェック

# フロントエンド側
cd frontend
pnpm lint-fix          # 全ての自動修正を実行
pnpm lint:eslint       # ESLintチェック
pnpm lint:prettier     # Prettierチェック
pnpm lint:style        # Stylelintチェック
pnpm lint:text         # Textlintチェック
```

## 💡 よく使うコマンド

### 開発作業
```bash
# フロントエンドの型チェック
cd frontend && pnpm run typecheck

# Railsのテスト実行
bundle exec rspec

# RuboCopによるコード整形
bundle exec rubocop -A

# フロントエンドのビルドとRailsへの反映
rails react_router:build

# API クライアント再生成
bin/openapi-generate
```

## 🚀 本番環境へのデプロイ

### Docker デプロイ
```bash
# フロントエンドビルド & Rails アセット生成
rails react_router:build

# Dockerイメージのビルド
docker build -t rails-react-boiler-template .

# Kamalを使用したデプロイ
bundle exec kamal deploy
```

### 環境変数設定
```bash
# 本番環境で必要な環境変数
RAILS_MASTER_KEY=<config/master.key の内容>
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

詳細なデプロイ手順については `config/deploy.yml` を参照してください。

## 🤝 開発ガイドライン

### コード品質
- **TypeScript**: 型安全性を最優先
- **ESLint/RuboCop**: コード品質の自動チェック
- **Prettier**: 一貫したフォーマット
- **テスト**: 新機能には必ずテストを追加

### API 設計
- **OpenAPI First**: スキーマ駆動開発
- **RESTful**: REST 原則に従ったエンドポイント設計
- **JSON API**: 一貫したレスポンス形式

### UI/UX
- **shadcn/ui**: デザインシステムの一貫性
- **アクセシビリティ**: WCAG準拠
- **レスポンシブ**: モバイルファースト
