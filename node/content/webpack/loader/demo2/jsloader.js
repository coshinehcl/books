const { getOptions } = require('loader-utils');
function loader(source){
    console.log('js body',source)
    return source + '\n // 这里是新增的'
}
loader.pitch = function(a,b,c) {
    console.log('js pitch',a,b,c)
}
module.exports = loader;