let ejs = require('ejs');
const path = require('path');
console.log(path.resolve(__dirname,'one.html'))
ejs.renderFile(path.resolve(__dirname,'one.html'),{name:'hcl'},{
    debug:true
},function(err,str){
    console.log(err,str)
})