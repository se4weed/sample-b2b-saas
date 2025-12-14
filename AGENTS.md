# AGENTS.md

このドキュメントは、本リポジトリで AI エージェント（Cursor / Codex CLI など）が安全かつ一貫性のある変更を行うためのガイドです。`.cursor/` のルールを明文化し、実装・テスト・変更提案時の基準をまとめています。

## 基本方針

- 目的駆動: ユーザーストーリーと受入基準を最優先し、最小の差分で解決する。
- 一貫性: 既存のスタイル・命名・構成に合わせる（不要なリネームや再構成を避ける）。
- 最小影響: 変更範囲を限定し、副作用を最小化。関連しない修正は行わない。
- テスト優先: 変更にはテストを伴わせ、既存テストを壊さない。
- ドキュメント更新: 仕様・使い方に影響する場合は README 等を更新。

## 作業フロー（推奨）

1. 影響範囲の特定: 変更対象ファイル・近接コード・関連テストを確認。
2. 設計メモ: 目的・アプローチ・代替案を簡潔に整理（PR/コミット説明に転用）。
3. 実装: 既存スタイルに合わせて最小差分で実装。
4. テスト追加/更新: 下記ガイドライン（RSpec/Vitest）に厳密に従う。
5. ローカル検証: Lint/型チェック/テストを実行。
6. ドキュメント: 影響がある場合に限り README などを更新。

## 変更の判断基準（Do / Don’t）

- Do: バグ修正、明確な要件の実装、既存規約への準拠、テストの追加。
- Don’t: 無関係な最適化、命名・構造の無断大規模リファクタリング、規約逸脱。

## テストガイドライン（Rails / RSpec）

`.cursor/rules/rspec.mdc` に準拠。対象: `spec/**/*`（主にリクエストテスト）。

- アサーション: `have_http_status` や `have_http_response` ではなく、`assert_schema_conform(STATUS)` を使用。
- it の表現: ステータス確認は「return 数字」、その他は「〜こと」「〜であること」。
- context の表現: 「〜の場合」「〜のとき」「〜が存在する場合」。
- リクエスト行の直後に改行を入れる（例: `get xxx_path` の後で 1 行空ける）。
- 必要に応じて `include Committee::Rails::Test::Methods` と `sign_in_as(user)` を使用。
- 期待レスポンスは `expected_body` を構築し `to_json` で厳密一致を取る。
- チェックリスト: 不要コメントなし・条件分岐カバー・全テスト成功・改行ルール遵守。

例（抜粋）:

```ruby
describe "GET /xxxx/xxxx" do
  let(:user) { FactoryBot.create(:user) }

  before { sign_in_as(user) }

  it "return 200" do
    get api_v1_xxx_path

    assert_schema_conform(200)
  end

  it "xxxが返されること" do
    get api_v1_xxx_path

    expected_body = { xxx: "value" }
    expect(response.body).to eq expected_body.to_json
  end

  context "xxxの場合" do
    it "return 422" do
      get api_v1_xxx_path

      assert_schema_conform(422)
    end
  end
end
```

## テストガイドライン（Frontend / Vitest）

`.cursor/rules/vitest.mdc` に準拠。対象: `frontend/spec/*`。

- 必須インポート: `vitest` 本体、`@testing-library/react`、`@testing-library/user-event`、`react-router` の `BrowserRouter`、`server`（MSW）、`Layout`（共通ラッパー）。
- Layout: 必ず `frontend/spec/helpers/Layout.tsx` を使用してラップする。
- userEvent: `user` というモデルと衝突しないよう `const userAction = userEvent.setup()` を推奨。
- 非同期待機: ユーザー操作や API 呼び出し後は `waitFor` を用いる。
- アサーション: 存在確認には `toBeInTheDocument()` を使用（`toBeTruthy()` は使わない）。
- MSW: orval 生成の MSW モック（`frontend/app/gen/api-client/*/*.msw.ts`）を活用し、`server.use(...mock)` で適用。
- エラー時の UI 確認: 422 などのエラー応答ではトースト/フォームエラー表示を検証。
- 文字列: ダブルクォートを使用（プロジェクト規約）。

スケルトン（抜粋）:

```tsx
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";
import { server } from "../../setupTests";
import { Layout } from "../../helpers/Layout";

describe("Component", () => {
  const userAction = userEvent.setup();

  it("Componentが表示されること", async () => {
    const mock = [ /* orval/Msw モックハンドラ */ ];
    server.use(...mock);

    render(
      <BrowserRouter>
        <Layout>
          <Component />
        </Layout>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("hogehoge")).toBeInTheDocument();
    });
  });
});
```

API モックの OK/NG（抜粋）:

- NG: `server.use(getPostUsersMockHandler(() => { throw new Error("...") }))`
- OK: `server.use(...[http.put(getPutHogehogeMutationKey(...), () => new HttpResponse(JSON.stringify({ error: "...", errorDetails: [...] }), { status: 422, headers: { 'Content-Type': 'application/json' } }))])`

## 実行コマンド（参考）

- Rails テスト: `bundle exec rspec`
- リクエストテストのみ: `bundle exec rspec spec/requests/`
- フロントエンドテスト: `pnpm --filter frontend test`
- フロントエンド Lint: `pnpm --filter frontend lint`
- 型チェック: `cd frontend && pnpm typecheck`
- Rails Lint/Format: `bundle exec rubocop`（自動修正は `-A`）

## テスト/Lint の実行方法（標準）

バックエンド（Rails）

```bash
bundle exec rspec        # 全テスト
bundle exec rubocop      # Lint（整形は -A）
```

フロントエンド（React / Vite）

```bash
pnpm --filter frontend test   # フロントエンドの全テスト
pnpm --filter frontend lint   # フロントエンドのLint一式
```

## ファイル/ディレクトリの準拠

- RSpec ルール適用対象: `spec/**/*`
- Vitest ルール適用対象: `frontend/spec/*`
- orval 生成物: `frontend/app/gen/api-client/**`
- MSW ハンドラ: `frontend/app/gen/api-client/*/*.msw.ts`
- テスト用 Layout: `frontend/spec/helpers/Layout.tsx`

## ディレクトリ構成

```
rails-react-boiler-template/
├── app/                         # Rails API (ドメインロジック)
│   ├── controllers/             # API コントローラ (例: Api::V1)
│   ├── models/                  # ActiveRecord モデル
│   ├── commands/                # コマンド層（ユースケース/アプリケーションサービス）
│   ├── mailers/                 # メイラー（通知/メール送信）
│   ├── jobs/                    # 非同期ジョブ（Solid Queue など）
│   └── views/                   # メール/ビュー資産（mailer レイアウトや PWA 資産を含む）
├── spec/                        # Rails テスト
│   ├── requests/api/v1/*_spec.rb    # リクエストテスト（Committee使用）
│   └── support/*.rb                 # ヘルパー（例: authentication_helpers）
├── frontend/                    # React SPA
│   ├── app/
│   │   ├── routes/*.tsx            # 画面ルート
│   │   ├── components/ui/*         # shadcn/ui プリミティブ
│   │   ├── components/shared/*     # 共有UI（アトム/分子）
│   │   ├── core/*                  # 機能単位（signin など）
│   │   ├── hooks/*                 # React Hooks
│   │   ├── lib/*                   # ユーティリティ
│   │   ├── globalStates/*          # グローバル状態（SWR 等）
│   │   ├── config/*                # 規約/文書/設定
│   │   └── gen/api-client/*        # orval 生成（ts と *.msw.ts）
│   ├── spec/                       # フロントエンドテスト
│   │   ├── setupTests.ts
│   │   ├── helpers/Layout.tsx
│   │   └── app/**.test.(ts|tsx)
│   ├── vite.config.ts / vitest.config.ts / tsconfig.json
│   └── orval.config.ts / eslint.config.ts / prettier.config.ts
├── openapi/
│   ├── resources/                 # エンドポイント定義
│   └── merged/                    # マージ済みスキーマ
└── public/frontend/               # ビルド済み SPA アセット
```

配置ルール（要点）

- Backend API: `app/controllers/api/v1/*_controller.rb` を追加し、対応するリクエストテストを `spec/requests/api/v1/*_controller_spec.rb` に作成。`assert_schema_conform` を用いてスキーマ整合を検証。
- Commands: 複数モデルに跨るユースケースや副作用を伴う処理は `app/commands/*_command.rb` に集約し、コントローラから呼び出す。命名は `<Action>Command`。
- Mailers: 通知系は `app/mailers/*_mailer.rb` に実装し、テンプレートは `app/views/<mailer>/<action>.(html|text).erb` に配置。レイアウトは `app/views/layouts/mailer.*` を使用。
- Jobs: 時間のかかる処理/メール送信等は `app/jobs/*_job.rb` に実装し、`perform` を定義。キュー名・リトライ方針はジョブ内で明示。
- Frontend Page: ページは `frontend/app/routes/*.tsx` に追加。必要に応じて `frontend/app/routes.ts` や `frontend/react-router.config.ts` と整合。
- Feature 実装: UI/ロジックは `frontend/app/core/<feature>/` 配下に配置。共通 UI は `components/shared`、プリミティブは `components/ui` を使用。
- API クライアント: `frontend/app/gen/api-client/**` は自動生成物のため直接編集しない。OpenAPI を更新し `bin/openapi-generate` を実行。
- フロントテスト: `frontend/spec/app/**` に `*.test.ts(x)` を配置し、`helpers/Layout.tsx` で必ずラップ。MSW モックは生成済みハンドラを `server.use(...mock)` で適用。

## エージェント向け注意点

- OpenAPI に基づく I/F 変更がある場合、`bin/openapi-generate` の再実行が必要になる可能性あり（PR 説明に明記）。
- 既存の `describe`/`context`/`it` の日本語ルールやレスポンス検証の厳密一致を崩さない。
- Rails リクエストテストでは、`get/post/put...` 直後の改行ルールを必ず守る。
- フロントエンドでは Layout ラップ・MSW モック・`waitFor` を徹底。
- 無関係な最適化や構成変更は提案に留め、実装はスコープ外とする。

## 参考

- `.cursor/rules/rspec.mdc`
- `.cursor/rules/vitest.mdc`
- `README.md`（環境構築・テスト実行・Lint 設定）
