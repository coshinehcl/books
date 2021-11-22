const { stringifyRequest, getOptions } = require('loader-utils');
// 全走Normal-Loader
// function loader(source){
//     console.log('source',source)
//     return source + `\n // 修改自b-loader;`
// }

// a-loader.js走pitch
// function loader(source){
//     console.log('source',source)
//     return source + `\n // 修改自b-loader;`
// }
// loader.pitch = function(){
//     console.log('b-loader pitch')
// }

// b-loader.js走pitch
// function loader(){}
// loader.pitch = function(remainingRequest,precedingRequest,data) {
//     // 获取到源码，添加`\n // 修改自b-loader;` 即可。
//     // 因为这里是最后一个，所以这里的remainingRequest为原请求
//     const brequirePath = stringifyRequest(this, '!!' + remainingRequest);
//     return `require(${brequirePath})\n // 修改自b-loader;`
// }
// 细节测试
function loader(source){
    console.log('b-loader normal',source)
    return source + `\n // 修改自b-loader;`
}
loader.pitch = function(remainingRequest,precedingRequest,data){
    console.log('b-loader pitch')
    console.log(1,remainingRequest)
    console.log(2,precedingRequest)
    console.log(3,stringifyRequest(this, '!!' + remainingRequest))
}
module.exports = loader;