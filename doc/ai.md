あなたはシニアフロントエンドエンジニアです。

# プロジェクト

NyanTube

YouTube風のOSS動画クライアントを開発しています。

目的はYouTubeの代替クライアントであり、
FreeTubeやInvidiousのような体験を目指します。

ただしYouTubeのロゴや商標は使用せず、
UI構成のみ参考にします。

---

# 技術スタック

- Bun
- TypeScript
- Vite
- Preact
- TailwindCSS v4
- shadcn/ui
- youtubei.js
- preact-router

---

# 現在の状態

youtubei.jsはブラウザでは利用せず、
別プロセスのBun APIサーバーで動作しています。

フロントエンドは

fetch("/api/search?q=keyword")

で検索結果を取得します。

Vite Proxy経由で通信します。

---

# 動画データ型

```ts
export type Video = {
  id: string;
  title: string;
  author: string;
  views: string;
  published: string;
  thumbnail: string;
};
```

```
┌────────────────────────────────────────────┐
│ ☰ NyanTube       [検索欄]            🔍    │
├─────────────┬──────────────────────────────┤
│ ホーム      │                              │
│ 登録        │                              │
│ 履歴        │      動画一覧                │
│ 後で見る    │                              │
│ DL          │                              │
│ 設定        │                              │
└─────────────┴──────────────────────────────┘
```

実装してほしいもの
- レイアウト
- Header
- Sidebar
- MainContent
コンポーネント分割すること

Header
  表示項目
  - ハンバーガーメニュー
  - NyanTubeロゴ
  - 検索入力欄
  - 検索ボタン
  shadcn/uiを利用すること

Sidebar
  項目
  - ホーム
  - 登録チャンネル
  - 履歴
  - 後で見る
  - ダウンロード
  - 設定
  Lucideアイコンを利用すること

動画一覧
  レスポンシブ対応
  ```
  スマホ 1列
  タブレット 2列
  PC 3～5列
  ```

VideoCard
  表示内容
  - サムネイル
  - タイトル
  - チャンネル名
  - 再生回数
  - 投稿日
  shadcn Cardを利用すること

動画再生
  要件
  動画カードクリック時に
  /watch/:id
  へ遷移すること

Watchページ
  動画は最初は再生しない
  最初はサムネイルのみ表示
```
┌──────────────┐
│  サムネイル   │
│      ▶       │
└──────────────┘
```

クリック時のみ
<iframe>
を生成すること
iframe URL
https://www.youtube.com/embed/{videoId}?autoplay=1


ルーティング
  preact-routerを使用
  /
  ↓
  ホーム
  /watch/:id
  ↓
  動画再生
  /channel/:id
  ↓
  チャンネル

コーディング規約
- TypeScript
- 関数コンポーネント
- hooks使用
- any禁止
- 型定義を行う
- コンポーネント分割
- 1ファイル肥大化禁止

推奨構成
```
src/
├─ components/
│  ├─ layout/
│  ├─ video/
│  └─ ui/
│
├─ pages/
│  ├─ HomePage.tsx
│  ├─ WatchPage.tsx
│  └─ ChannelPage.tsx
│
├─ types/
│  └─ video.ts
│
├─ services/
│  └─ api.ts
│
├─ router/
│  └─ index.tsx
│
└─ app.tsx
```

出力形式
ファイル単位で出力してください。

例
`src/components/video/VideoCard.tsx`
```tsx
コード
```
の形式で出力してください。

実装コードのみ出力してください。
説明文は不要です。