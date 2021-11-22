# 自定义loader
```js
// 整章学习
// 1、demo1：最基础的loader
// 2、demo2：测试加载不同内容（css,js,img）
// 3、demo3：学习Normal-loader和Pitch-loader。深入了解如何使用loader
// 4、demo4：学习案例（sytle-loader,css-loader,vue-loader）
// 5、demo5：结合babel来做一个实用项目。（自动加上注释、压缩）
```
## 一、介绍
```js
// 自定义loader
// 这里是最最基本的。用于测试怎么用
// 后续demo会加强

// 自定义loader
/**
 * @param {string|Buffer} content 源文件的内容
 * @param {object} [map] 可以被 https://github.com/mozilla/source-map 使用的 SourceMap 数据
 * @param {any} [meta] meta 数据，可以是任何内容
 */
function webpackLoader(content, map, meta) {
  // 你的webpack loader代码
}
module.exports = webpackLoader;
```
[介绍](https://juejin.cn/post/6992754161221632030)
## 二、测试
```js
// 配置
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
```
```js
// jsloader.js
const { getOptions } = require('loader-utils');
module.exports = function(source){
    // 看看source是什么
    console.log('rource',source)
    // 怎么获取loader参数
    // 方式1
    console.log(getOptions(this))
    // 方式2
    // loaderIndex: 0, 为当前loader
    console.log(this.loaders[this.loaderIndex].options)
    return source
}

// 输出
rource console.log('index')
{ hh: 1 }
{ hh: 1 }
```

## 三、总结