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

<img width="1432" alt="image" src="https://github.com/user-attachments/assets/44ef36b9-bdc5-487f-ba6a-1383fb367a8b">

アクセス後にバケットを選択
<img width="1400" alt="image" src="https://github.com/user-attachments/assets/1ba207b6-3c8c-4b87-8440-53e96ba57cfa">

右上の設定（歯車）を選択


<img width="1189" alt="image" src="https://github.com/user-attachments/assets/724767ee-c96d-4afb-8b79-3dc43d809a54">

publicに選択

<img width="494" alt="image" src="https://github.com/user-attachments/assets/e73c57d5-e41e-4007-a5ba-11d0a7f7575e">

<img width="748" alt="image" src="https://github.com/user-attachments/assets/f043aea2-fad8-48cd-8be7-74b320895911">

この設定を `video`と`thumbnail-image`にも設定します。これで動画を視聴することができます。
