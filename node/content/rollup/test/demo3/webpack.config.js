const path = require('path')
module.exports = {
    mode:"none",
    entry:'./src/index.js',
    output:{
        path:path.resolve('./dist'),
        filename:'app.js',
        library: {
            name: 'MyLibrary',
            type:'umd'
          },
    }
}