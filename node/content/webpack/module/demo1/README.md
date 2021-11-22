# module

## 一、介绍
这些选项决定了如何处理项目中的不同类型的模块。

```js
{
    noParse:RegExp [RegExp] function(resource) string [string],
    rules:[rule]
}

// 这节我们 来分析下noParse
// 下节，我们重点来分析rules
```
## 二、noParse
```js
// 防止 webpack 解析那些任何与给定正则表达式相匹配的文件。
// 忽略的文件中 不应该含有 import, require, define 的调用，或任何其他导入机制。！！！
// 忽略大型的 library 可以提高构建性能
```
```js
// 测试代码

// other.js
console.log('other')
export default 'other'

// index.js
import other from './other'
console.log('index',other)

// 配置
module:{
    noParse:content => {
        console.log('content',content,/other.js/.test(content));
        return /other.js/.test(content)
    }
}
```
```js
// 输出
content /Users/hcl/Desktop/books/node/content/webpack/module/demo1/src/index.js false
content /Users/hcl/Desktop/books/node/content/webpack/module/demo1/src/other.js true
asset main.js 3.07 KiB [emitted] (name: main)

// 看打包后代码
/* 1 */
/***/ (function(module, exports) {

console.log('other')
export default 'other'

/***/ })


// 总结：
// 也就是对于该模块内的内容，不会去处理。

// 也就是如果我们使用的库，内部没有导入语法，则不需要去解析。我们就可以配置noParse
```
## 三、总结