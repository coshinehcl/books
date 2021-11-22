const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname,'./src'),
    entry:'./index.js',
    module:{
        rules:[{
            test:/.js$/,
            use:['a-loader','b-loader']
        }]
    },
    resolveLoader: {
        modules: [
          path.resolve(__dirname, "node_modules"),
          path.resolve(__dirname),'/',
        ],
      }
}