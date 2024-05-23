import path from 'path'
import { defineConfig } from "vite"
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'


export default defineConfig({
  resolve: {
    alias: {
      'page': resolve(__dirname, 'src/page'),
      'comp': resolve(__dirname, 'src/component'),
      'util': resolve(__dirname, 'src/util'),
      'style': resolve(__dirname, 'src/style'),
      'data': resolve(__dirname, 'src/data'),
      'directive': resolve(__dirname, 'src/directive')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  plugins: [
    vue(),
    legacy({
        targets : ['firefox 43']
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "${path.resolve(__dirname, 'src/style/dict.less')}";`,
        javascriptEnabled: true,
      }
    }
  },
  server: {
    // 配置服务器
    hmr: {
      overlay: false
    }
  }
})