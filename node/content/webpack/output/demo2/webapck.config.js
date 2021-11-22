const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    entry:'./src/index.js',
    output:{
        path:path.resolve('./dist'),
        pathinfo:'verbose'
    }
}