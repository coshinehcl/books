module.exports = {
    mode:'none',
    // 测试publicPath
    // output:{
    //     // __webpack_require__.p = "./";
    //     //var url = __webpack_require__.p + __webpack_require__.u(chunkId);
    //     // publicPath:'./'
    //     publicPath:'./test', // 不影响存放位置，都是放在./dist目录下。如上，只是影响加载路径
    // }
    // output:{
    //     filename:'[name].js',
    //     publicPath:'./',
    //     chunkFilename:'[id].asyc.js' // 默认使用 [id].js
    // }
    // output:{
    //     filename:'[name].js',
    //     publicPath:'./',
    //     chunkFilename:(pathData)=>{
    //         //输出该chunk的pathData
    //         console.log(pathData); 
    //         // pathData.chunk可以获取到当前异步chunk的chunk信息
    //         return pathData.chunk.id + '.asyc.js'
    //     },
    // }
    // 测试chunkLoadingGlobal和chunkLoading
    output:{
        filename:'[name].js',
        publicPath:'./dist/',
        chunkFilename:'[id].asyc.js', // 默认使用 [id].js
        chunkLoadingGlobal:'xx',
        chunkLoading:'require'
    }
}