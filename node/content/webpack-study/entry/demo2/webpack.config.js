const path = require('path')
console.log(__dirname)
module.exports = {
    mode:'none',
    context:path.resolve(__dirname, './'),
    //如果传入一个对象，对象的属性的值可以是一个字符串、字符串数组或者一个描述符(descriptor):
    // entry:{
    //     main:'./src/index.js',
    //     // 这里可以对比demo1的multi-main entry，其实是一个意思
    //     main1:['./src/index1.js','./src/index2.js']
    // }
    // 下面重点来分析下描述符的使用
    // 1、字符串->对象
    // entry:{
    //     main:{
    //         import: './src/index.js'
    //      // import:['./src/index.js','./src/index1.js']
    //     }
    // }
    // 2、filename 覆盖output的filename
    // entry:{
    //     main:{
    //         import: './src/index.js',
    //         // filename:'xx.js'
    //     }
    // },
    // output:{
    //     filename:'[name].chunk.js'
    // }
    //
    //3、dependOn：外部依赖，于是内部不会再把相关依赖导入
    // 注意，外部依赖必须是入口，也就是一个chunk。
    // 如何共享呢，index1的chunk会往全局对象注入对应方法,main这边读取
    // 作用：可以把部分依赖扔出去（在外部增加一个entry入口即可）
    // entry:{
    //     main:{
    //         import:'./src/index3.js',
    //         dependOn:'index1'
    //     },
    //     index1:'./src/index1.js'
    // }
    // dependOn的值也可以是数组
    // entry:{
    //     main:{
    //         import:'./src/index3.js',
    //         dependOn:'index'
    //     },
    //     index:['./src/index1.js','./src/index2.js']
    // }
    //4、懒加载：layer和chunkLoading
    // 这个放到后面来分析
    // entry:{
    //     main:{
    //         import: './src/index.js',
    //         chunkLoading:'jsonp',
    //         layer:'name of layer'
    //     }
    // },
}