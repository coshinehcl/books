const path = require('path')
// output.path
module.exports = {
    mode:'none',
    entry:{
        main:'./src/index.js'
    },
    output:{
        // output 目录对应一个绝对路径
        path:path.resolve(__dirname,'./dist1'),
        filename:'[name].js'
    },
}