# Node.js 公式イメージ
FROM node:20

# 作業ディレクトリ
WORKDIR /usr/src/app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係インストール
RUN npm install

# ソースコードをコピー
COPY . .

# ポート開放
EXPOSE 5173

# Vite 開発サーバー起動
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
