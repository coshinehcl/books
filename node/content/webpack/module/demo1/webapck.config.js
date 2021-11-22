const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    entry:'./src/index.js',
    // 如果devtool没有设置，则development默认会设置这里eval
    // devtool:'source-map',
    output:{
        path:path.resolve('./dist'),
    },
    module:{
        noParse:content => {
            console.log('content',content,/other.js/.test(content));
            return /other.js/.test(content)
        }
    }
}