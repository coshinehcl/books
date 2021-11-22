const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    // entry:'./src/index.js'
    entry:['./src/index.js','./src/other.js']
}