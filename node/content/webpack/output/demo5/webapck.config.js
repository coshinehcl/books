const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    // entry:'./src/index.js',
    // 测试devtool
    entry:'./src/index1.js',
    devtool:'source-map',
    output:{
        path:path.resolve('./dist'),
        clean:{
            dry:true
        },
        // library:'myLibrary'
        // library:{
        //     name:'myLibrary',
        //     type:'umd',
        //     export:['a','b','c']
        // }
        iife:true,
        // sourceMapFilename:'[file].map',
        // sourcePrefix:'asfasfafsafasfafaf'
    }
}