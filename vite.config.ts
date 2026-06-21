import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Viteの設定（開発サーバーとビルドの設定）
// GitHub Pagesで公開するため、baseパスをリポジトリ名に合わせる
// 公開URL: https://ユーザー名.github.io/kazumon/
export default defineConfig({
  plugins: [react()],
  base: '/kazumon/',
  server: {
    port: 5173,
    open: true,
  },
})
