# OpenTube

OpenTubeは、カスタマイズされたYouTube視聴体験を提供するように設計されたWebアプリケーションです。PreactとViteで構築され、動画ストリーミングとコンテンツ取得には`youtubei.js`と`video.js`を活用しています。パフォーマンスと、クリーンでカスタマイズ可能なユーザーインターフェースに重点を置いています。

![Image 1](assets/image1.png)
![Image 2](assets/image2.png)
![Image 3](assets/image3.png)

## このプロジェクトで使用されているライブラリ

### コア
- **Preact**: Reactの軽量版。

- **Vite**: 次世代フロントエンドツール。

- **TypeScript**: 開発者エクスペリエンスを向上させる型付きJavaScript。

### 動画とAPI
- **video.js / @videojs/react**: 堅牢な動画プレーヤー実装。

- **youtubei.js**: YouTubeの内部APIと連携するための強力なライブラリ。

- **videojs-youtube**: video.js内でYouTube動画を再生するための統合ライブラリ。

### UIとスタイリング
- **TailwindCSS**: ユーティリティファーストのCSSフレームワーク。

- **shadcn / Radix UI**: アクセシビリティが高くカスタマイズ可能なコンポーネントプリミティブ。

- **Lucide React**: 美しく一貫性のあるアイコンライブラリ。

### 状態とストレージ
- **Dexie.js**: ローカルデータ永続化のためのIndexedDBラッパー。


## 使用方法

1. **依存関係のインストール:**

```bash

npm install
```

2. **開発サーバーの起動:**

```bash

npm run dev
```

3. **本番環境向けビルド:**

```bash

npm run build
```

4. **バックエンド/ユーティリティサーバーの起動:**

```bash

npm run server
```

## ロードマップ

### 現在実装済み
- [x] 基本的なUI構造（レイアウト、サイドバー、ヘッダー）
- [x] 動画プレーヤーの統合
- [x] 動画ページ
- [x] ルーティング設定
- [x] YouTube APIの初期統合
- [x] オフラインダウンロードのサポート
- [x] 後で見る機能の管理
- [x] 広告の非表示

### 計画中
- [ ] チャンネルページ
- [ ] 検索機能の強化
- [ ] ユーザー認証/サブスクリプション管理
- [ ] 高度な履歴機能
- [ ] 設定のカスタマイズ
- [ ] アプリ化
- [ ] 高度な設定 (Like Youtube Enchanser)
- [ ] その他便利な機能