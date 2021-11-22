const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    entry:'./src/index.js',
    cache:{
        type:"filesystem",
        cacheDirectory:path.resolve(__dirname,'cache'),
        name:'hcl',
        maxAge:4000,
        compression:'gzip'
    },
    output:{
        path:path.resolve('./dist')
    }
}