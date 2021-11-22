const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    entry:'./src/index.js',
    watch:true,
    watchOptions:{
        poll:5000
    },
    output:{
        path:path.resolve('./dist'),
        pathinfo:'verbose'
    },
    stats:'normal' // 输出类型
}