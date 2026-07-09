# 徳川ミュージックアカデミー チャットボット

徳川ミュージックアカデミーの教室案内用チャットボットです。
`knowledge.txt` の内容をもとに、レッスン、振替、クラス変更、休会・退会などの質問に回答します。

## 使用技術

- Next.js
- React
- TypeScript
- Tailwind CSS
- Gemini API (`@google/genai`)

## セットアップ

依存パッケージをインストールします。

```bash
npm install
```

プロジェクト直下に `.env.local` を作成し、Gemini APIキーを設定します。

```bash
GEMINI_API_KEY=your_api_key_here
```

## 起動方法

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで開きます。

```text
http://localhost:3000
```

## 確認コマンド

コードの確認:

```bash
npm run lint
```

型チェック:

```bash
npx tsc --noEmit
```

本番ビルド:

```bash
npm run build
```

## 主なファイル

- `src/app/page.tsx`: チャット画面の全体レイアウト
- `src/components/`: ヘッダー、入力欄、メッセージ表示などのUI部品
- `src/hooks/useChatMessages.ts`: 送信、履歴保存、キャンセル、再送信などのチャット処理
- `src/app/api/chat/route.ts`: Gemini APIへの問い合わせ処理
- `knowledge.txt`: チャットボットが回答に使う教室情報

## 回答ルール

チャットボットは `knowledge.txt` の内容をもとに回答します。
資料に回答できる根拠がない場合は、次の案内を返すようにしています。

```text
大変申し訳ありませんがスクールチャットまたはお電話でお問い合わせください
```

## 注意事項

- `.env.local` はGitHubにpushしないでください。
- `knowledge.txt` を更新すると、チャットボットの回答内容も変わります。
- 本番環境では `GEMINI_API_KEY` をデプロイ先の環境変数にも設定してください。
