const { getOptions } = require('loader-utils');
module.exports = function(source){
    // 看看source是什么
    console.log('rource',source)
    // 怎么获取loader参数
    // 方式1
    console.log(getOptions(this))
    // 方式2
    // loaderIndex: 0, 为当前loader
    console.log(this.loaders[this.loaderIndex].options)
    return source
}