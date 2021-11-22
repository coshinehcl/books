# entry

## 一、介绍

```js
// 1、String  // 入口文件路径，如 './src/index.js'
// 2、Array   // 入口文件路径数组 如['./src/index.js','./src/other.js']
// 3、Object  // 这个在demo2来重点介绍
// 4、Function // demo2介绍
```

## 二、测试

### 1、String

```js
const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    entry:'.src/index.js'
}
```
```js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
console.log('index')
/******/ })()
;
```

### 2、Array

```js
const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    // entry:'./src/index.js'
    entry:['./src/index.js','./src/other.js']
}
```
```js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
console.log('index')
})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
console.log('other')
})();

/******/ })()
;
```

## 三、总结
```js
// 我们也可以将一个文件路径数组传递给 entry 属性，这将创建一个所谓的 "multi-main entry"。
// 在你想要一次注入多个依赖文件，并且将它们的依赖关系绘制在一个 "chunk" 中时，这种方式就很有用。

// 也就是数组类型，则会把这些入口，放在一个chunk中。！！！
// String 和 Array 类型的，chunk 会被命名为 main。
```