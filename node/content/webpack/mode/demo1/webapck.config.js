const path = require('path');
module.exports = {
    mode:'development',
    context:path.resolve(__dirname),
    entry:'./src/index.js',
    // 如果devtool没有设置，则development默认会设置这里eval
    // devtool:'source-map',
    output:{
        path:path.resolve('./dist'),
    }
}