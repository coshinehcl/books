module.exports = {
    entry:['./src/index.js','./src/index1.js'],
    mode:'none',
    // module:{
    //     // 防止 webpack 解析那些任何与给定正则表达式相匹配的文件,可以提高性能
    //     // 测试运行webpack，然后观察webpack 5.35.0 compiled successfully in 78 ms这个时间
    //     noParse: /jquery|lodash/,
    // }
    module:{
        noParse:(content)=>{
            // 输出，entry入口的全路径
            return 'jquery'
        }
    }
}