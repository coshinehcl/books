module.exports = {
    mode:'none',
    entry:{
        main:'./src/index.js'
    },
    // experiments: {
    //     outputModule: true,
    // },
    output:{
        uniqueName:'sss',
        // filename:'[name].[hash:3].js',
        // 输出一个库，为你的入口做导出
        // library:'hcl'
        // library:{
        //     type:'window',
        //     name:'hcl'
        // }
        // 这里测试export
        library:{
            export:["x","y"],
            type:'umd',
            name:'hcl'
        }
    }
}