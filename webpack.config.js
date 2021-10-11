    
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
module.exports = {
    mode:'none',
    entry:{
        app:'./src/main.js',
    },
    output:{
        path: __dirname + '/dist',
        filename:'[name].js'
    },
    resolve: {
        alias: {
          'vue$': 'vue/dist/vue.esm.browser.js', // 用 webpack 1 时需用 'vue/dist/vue.common.js'
          'vue-router$':'vue-router/dist/vue-router.esm.browser',
          'vuex$':'vuex/dist/vuex.esm.browser.js',
          '@':path.resolve('/','src')
        }
    },
    module:{
        rules: [
            {
              test: /.vue$/,
              use: 'vue-loader',
            },
            {
              test:/.css$/,
              use:['style-loader','css-loader']
            },
            {
              test: /\.less$/i,
              use:['style-loader','css-loader','less-loader']
            },
            {
              test: /\.(png|svg|jpg|jpeg|gif)$/i,
              type: 'asset/resource',
            },
           {
             test: /\.(woff|woff2|eot|ttf|otf)$/i,
             type: 'asset/resource',
           },
          ], 
    },
    plugins: [
        // 请确保引入这个插件！
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
          template:'/src/index.html',
          inject:'body'
        })
      ],
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      // compress: true,
      port: 9000,
      open:true
    },
}