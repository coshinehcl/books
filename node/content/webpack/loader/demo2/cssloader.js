const { getOptions } = require('loader-utils');
function loader(source){
    console.log('css body',source)
    return '这里是css'
}
loader.pitch = function(a,b,c) {
    console.log('css pitch',a,b,c)
}
module.exports = loader;