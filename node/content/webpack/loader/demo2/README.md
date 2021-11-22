# loader

## 一、介绍
```js
// demo1我们测试了最基本的使用
// 这里我们测试不同类型

// 总结：
// source我们都能拿到里面的内容。然后输出内容，会被webpack打包在模块内（所以需要转换为js）
```
## 二、测试
```js
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
        },{
            test:/.css/,
            use:{
                loader:path.resolve('./cssloader.js'),
            }
        },{
            test:/.png/,
            use:{
                loader:path.resolve('./imgloader.js'),
            }
        }]
    }
}
```
```js
// 输出
js pitch /Users/hcl/Desktop/books/node/content/webpack/loader/demo2/src/index.js  {}
js body import './one.css'
// import './1.png'
console.log('index');


css pitch /Users/hcl/Desktop/books/node/content/webpack/loader/demo2/src/one.css  {}
css body .red {
    color: red;
}
```
## 三、总结