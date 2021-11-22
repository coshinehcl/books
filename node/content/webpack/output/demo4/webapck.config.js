const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    entry:'./src/index.js',
    output:{
        path:path.resolve('./dist'),
        // assetModuleFilename:'[name][ext]'
    },
    module: {
        rules: [
          {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
          },
         {
           test: /\.(png|svg|jpg|jpeg|gif)$/i,
           type: 'asset/resource',
         },
        ],
      },
}