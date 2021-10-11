const path = require('path')
console.log('hhh')
const { VueLoaderPlugin } = require('vue-loader')
console.log('VueLoaderPlugin',VueLoaderPlugin)
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode:'none',
    // devtool:'eval',
    // devtool:'source-map',
    // devtool:'inline-source-map',
    entry:{
        main:'./index.js'
    },
    output:{
        path:path.resolve(__dirname,'./dist'),
    },
    module: {
        rules: [
            {
                test:/.css$/,
                use:['style-loader','css-loader']
              },
          // ... 其它规则
          {
            test: /\.vue$/,
            loader: 'vue-loader'
          },
          {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource',
          },
        ]
      },
    plugins: [
        // 请确保引入这个插件！
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template:'./index.html',
            inject:'body'
          })
    ]
}