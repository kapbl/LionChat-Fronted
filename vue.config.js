const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'LionChat'
        return args
      })
  },
  devServer: {
    // proxy: {
    //   '/v1': {
    //     target: 'https://chlion.lionchat.online',
    //     changeOrigin: true,
    //     secure: true,
    //     ws: true
    //   }
    // }
  }
})
// https://chlion.lionchat.online/v1/api/user/register