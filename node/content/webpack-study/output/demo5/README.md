# 静态资源与assetModuleFilename

```js
// 源码
const img = require('../img/output.png')

// 配置
output:{
    assetModuleFilename:'xx[ext][query]'
}
// => 打包后
// 1、生成xx.png
// 2、加载
const img = __webpack_require__(1)

/* 1 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {
"use strict";
module.exports = __webpack_require__.p + "xx.png";
/***/ })
```

```txt
// 总结：
1、异步资源cdm路径都是__webpack_require__.p来配置的
2、异步chunk的名称是chunkFilename来配置
3、异步的资源名称是assetModuleFilename来配置
```
