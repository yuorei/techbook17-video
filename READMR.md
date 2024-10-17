# 仕組みから理解するストリーミング動画配信

「仕組みから理解するストリーミング動画配信」をご購入いただきありがとうございます。本リポジトリは「仕組みから理解するストリーミング動画配信」におけるサンプルコードを公開しています。
これを実行することで簡易的な動画配信サイトを構築することができます。

## 技術スタック

- フロントエンド: Next.js (App Router)
- バックエンド: Go
- データベース: SQLite3
- ストリーミングプロトコル: HLS
- ストレージ: MinIO
- インフラ: Docker Compose

## 起動

```bash
cp front/.env.example front/.env
```

```bash
docker compose up
```

http://localhost:3000 にアクセスすると、動画配信サイトが表示されます。

MinIOの管理画面にアクセスには、http://localhost:9000 にアクセスしてください。

ユーザー名: admin
パスワード: password
