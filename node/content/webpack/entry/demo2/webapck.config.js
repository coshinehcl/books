const path = require('path');
module.exports = {
    mode:'none',
    // watch: true,
    context:path.resolve(__dirname),
    // 字符串类型
    // entry:{
    //     main:'./src/index.js'
    // }

    // 字符串数组
    // entry:{
    //     main:['./src/index.js','./src/other.js']
    // }

    // 测试dependOn
    // entry:{
    //     other:{
    //         import:'./src/other.js',
    //         dependOn:'index'  // 这个值，只能是entry key !!!
    //     },
    //     index:'./src/index.js',
    // }

    // 测试filename
    // entry:{
    //     index:{
    //         import:'./src/index.js',
    //         filename:'[name].11.js'
    //     }
    // }

    // 测试library
    // entry:{
    //     index:{
    //         import:'./src/index.js',
    //         library: {
    //             type:'window',
    //             name: 'MyLibrary',
    //         },
    //     }
    // }

    // 测试runtime
    // entry:{
    //     index:{
    //         import:'./src/index.js',
    //         runtime:'hello'
    //     },
    //     other:{
    //         import:'./src/other.js',
    //         runtime:'hello1'
    //     }
    // }

    // 测试publicPath
    // entry:{
    //     index:{
    //         import:'./src/index.js',
    //         publicPath:'./index'
    //     },
    //     other:{
    //         import:'./src/other.js',
    //         publicPath:'./other'
    //     }
    // }
    entry:()=>{
        return {
            index:'./src/index.js',
            other:'./src/other.js'
        }
    }
}