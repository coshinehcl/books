# mode

## 一、介绍
```js
// 提供 mode 配置选项，告知 webpack 使用相应模式的内置优化

// 1、development：启用DefinePlugin设置process.env.NODE_ENV
// 2、production:启用DefinePlugin设置process.env.NODE_ENV。及其它
// 3、none
```
## 二、测试
```js
// 测试代码
// index.js
function test(x,y){
    const x1 = 1;
    console.log(process.env.NODE_ENV)
    return x + y;
}
const b  = 2;
const c = test(2,3);
console.log(c)
```
### 1、development
```js
// 1、启用DefinePlugin设置process.env.NODE_ENV
// 2、如果没有设置develop，则会设置为eval
// 3、开启pathinfo
```
```js
// 效果
// 关注下上面总结三个作用

/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ (() => {

eval("function test(x,y){\n    const x1 = 1;\n    console.log(\"development\")\n    return x + y;\n}\nconst b  = 2;\nconst c = test(2,3);\nconsole.log(c)\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/index.js"]();
/******/ 	
/******/ })()
;
```
### 2、production

```js
// 1、启用DefinePlugin设置process.env.NODE_ENV
// 2、代码压缩
// 3、没用到的代码剔除
```
```js
// 输出
(()=>{const o=(2,3,console.log("production"),5);console.log(o)})();
```

## 三、总结