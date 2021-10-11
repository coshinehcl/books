const path = require('path')
module.exports = {
    mode:'none',
    // devtool:'eval',
    devtool:'source-map',
    // devtool:'inline-source-map',
    entry:{
        main:'./src/index.js'
    },
    output:{
        path:path.resolve(__dirname,'./dist1'),
        // 看xx.map内容区别
        devtoolNamespace:'hcl',
        // 这个是修改xx.map中的sources的
        devtoolModuleFilenameTemplate:'webpack://[namespace]/[resource-path]?[loaders]'
    }
}