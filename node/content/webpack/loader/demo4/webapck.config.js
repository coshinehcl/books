const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname,'./src'),
    entry:'./index.js',
    module:{
        rules:[{
            test:/.css$/,
            use:{
                // css-loader style-loader
                // loader:'css-loader',
                loader:path.resolve('./my-style-loader')
            }
        }]
    }
}