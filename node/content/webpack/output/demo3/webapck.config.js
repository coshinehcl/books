const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    entry:'./src/index.js',
    output:{
        path:path.resolve('./dist'),

        // chunkFilename,默认使用 [id].js
        chunkFilename:'[id].other.js',
        // chunkLoadTimeout:2000,
        chunkLoadingGlobal: 'myCustomFunc',
        // chunkLoading:'jsonp'
        // crossOriginLoading:'anonymous',
        scriptType: 'module',
    }
}