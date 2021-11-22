const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname,'./src'),
    entry:'./index.js',
    module:{
        rules:[{
            test:/.js/,
            use:{
                loader:path.resolve('./jsloader.js'),
                options:{
                    hh:1
                }
            }
        }]
    }
}