const { stringifyRequest, getOptions } = require('loader-utils');
// 全走Normal-Loader 和 b-loader.js走pitch
// function loader(source){
//     console.log('source',source)
//     return source + `\n // 修改自a-loader;`
// }

//  a-loader.js走pitch
// function loader(){
//     // 这里为空，因为此时根本不会进这里
//     // 我们测试下!!下，会不会走这里，结果执行b-loader后，不会进这里
//     console.log('a-loading loader')
// }
// loader.pitch = function(remainingRequest,precedingRequest,data){
//     // 我们要让b-loader去处理
//     // remainingRequest：就是会让b去处理
//     // 转化为内联，且!!覆盖配置，避免再次匹配走这里
//     const brequirePath = stringifyRequest(this, '!!' + remainingRequest);
//     return `require(${brequirePath})\n // 修改自a-loader;`
// }

// 细节测试
function loader(source){
    console.log('a-loader normal',source)
    return source + `\n // 修改自a-loader;`
}
loader.pitch = function(remainingRequest,precedingRequest,data){
    console.log('a-loader pitch')
    console.log(1,remainingRequest)
    console.log(2,precedingRequest)
    console.log(3,stringifyRequest(this, '!!' + remainingRequest))
}
module.exports = loader;