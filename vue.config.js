const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // proxy: {
    //   '/v1': {
    //     target: 'http://62.234.192.227',
    //     changeOrigin: true,
    //     secure: false,
    //     ws: true
    //   },
    // }
  }
})