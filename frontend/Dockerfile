# Node.js 公式イメージ
FROM node:20

# 作業ディレクトリ
WORKDIR /usr/src/app

RUN mkdir -p /usr/src/app/node_modules && \
chown -R node:node /usr/src/app


# package.json と package-lock.json をコピー
COPY --chown=node:node package*.json ./

USER node

# 依存関係インストール
RUN npm install

# ソースコードをコピー
COPY --chown=node:node . .

# ポート開放
EXPOSE 5173

# Vite 開発サーバー起動
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
