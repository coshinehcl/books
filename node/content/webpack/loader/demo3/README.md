# loader的执行顺序
Normal Loader 和 pitching Loader 
这节需要理解他们的概念，及如何使用
## 一、介绍
```js
// 前面我们掌握了自定义最基本的loader
// 现在我们来看下loader的执行顺序

// 重点
// Normal Loader 和 pitching Loader 

// 1、Normal Loader
/**
 * @param {string|Buffer} content 源文件的内容
 * @param {object} [map] 可以被 https://github.com/mozilla/source-map 使用的 SourceMap 数据
 * @param {any} [meta] meta 数据，可以是任何内容
 */
function webpackLoader(content, map, meta) {
  // 你的webpack loader代码
}
module.exports = webpackLoader;

// 2、Pitching Loader
/**
 * @remainingRequest 剩余请求
 * @precedingRequest 前置请求
 * @data 数据对象，可以用于数据传递(在自己的Normal Loader 通过this.data可以获取到)
 */
function webpackLoader(){}
function pit(remainingRequest, precedingRequest, data) {
 // some code
};
webpackLoader.pitch = pit;
module.exports = webpackLoader;

// 顺序
// use:['a-loader','b-loader','c-loader']
// 则
// 先pitch
// a -> b -> c
// 再Normal
// c -> b -> a

// Pitch Loader 可以熔断后续loader。
// 如何熔断，如果有return 值，则会熔断
// 熔断效果：后续loader不会执行，直接进入上个loader的Normal Loader
```
[ Normal Loader 和 pitching Loader ](https://juejin.cn/post/6992754161221632030#heading-0)
## 二、测试
```js
// 我们用
// use:['a-loader','b-loader']
// 来测试

// 这两个分别是加上// 修改自[name]
```
### 1、全走Normal-Loader
```js
// a-loader.js
function loader(source){
    console.log('source',source)
    return source + `\n // 修改自a-loader;`
}

// b-loader.js
function loader(source){
    console.log('source',source)
    return source + `\n // 修改自b-loader;`
}

// 结果（main.js）
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
console.log('index')
 // 修改自b-loader;
 // 修改自a-loader;
/******/ })()
;
```
### 2、a-loader.js走pitch
```js
// 我们知道走了pitch就会熔断，走前面的loader的Normal-loader
// 因为a没有前面的loader了。所以return 结果，会直接作为最终结果。
// 因为// 修改自b-loader;是b-loader做的事情。那怎么做呢？

// 知识补充：我们可以使用内联Loader。且用前缀（！,!!,-!）来覆盖配置中的配置
// 1、！：将禁用所有已配置的 normal loader(普通 loader)
// 2、!!：将禁用所有已配置的 loade（preLoader, loader, postLoader）
// 3、-！：将禁用所有已配置的 preLoader 和 loader，但是不禁用 postLoaders
// 也就是loader按照分类，为pre,normal,inline,post四种
// 我们配重中的，如果没有配置enforce:'pre' 'post'。则就是normalLoader
// 我们内联Loader就是inlineLoader。
// 注意这里的区分，和我们执行时候的NormalLoader和PitchingLoader是两个概念，这里是安装运行时的区分。
// !!内联Loader。不会链式调用！！！

// OK。我们来想下应该怎么做
// 也就是应该a-loader的Pitch中，return `${b处理的结果}\n // 修改自a-loader`
// 也就是

// a-loader.js
function loader(){
    // 这里为空，因为此时根本不会进这里
}
loader.pitch = function(remainingRequest,precedingRequest,data){
    // 我们要让b-loader去处理
    // remainingRequest：就是会让b去处理
    // 转化为内联，且!!覆盖配置，避免再次匹配走这里
    const brequirePath = stringifyRequest(this, '!!' + remainingRequest);
    return `require(${brequirePath})\n // 修改自a-loader;`

}
module.exports = loader;

// 结果
(() => {
__webpack_require__(1)
 // 修改自a-loader;
})();

/* 1 */
/***/ (() => {

console.log('index')
 // 修改自b-loader;

/***/ })
```
### 3、b-loader.js走pitch
```js
// b-loader.js走pitch
// 也就是走熔断，后续会执行a-loader.js

// b-loader.js
// b-loader.js走pitch
function loader(){}
loader.pitch = function(remainingRequest,precedingRequest,data) {
    // 获取到源码，添加`\n // 修改自b-loader;` 即可。
    // 因为这里是最后一个，所以这里的remainingRequest为原请求
    const brequirePath = stringifyRequest(this, '!!' + remainingRequest);
    return `require(${brequirePath})\n // 修改自b-loader;`
}

// 结果
__webpack_require__(1)
 // 修改自b-loader;
 // 修改自a-loader;
})();

/* 1 */
/***/ (() => {

console.log('index')

/***/ })
```

### 4、细节
```js
// 1、我们来看下remainingRequest、precedingRequest、brequirePath都是什么值

// a-loader.js
function loader(source){
    console.log('a-loader normal',source)
    return source + `\n // 修改自a-loader;`
}
loader.pitch = function(remainingRequest,precedingRequest,data){
    console.log('a-loader pitch')
    console.log(1,remainingRequest)
    console.log(2,precedingRequest)
    console.log(3,stringifyRequest(this, '!!' + remainingRequest))
}
// b-loader.js
function loader(source){
    console.log('b-loader normal',source)
    return source + `\n // 修改自b-loader;`
}
loader.pitch = function(remainingRequest,precedingRequest,data){
    console.log('b-loader pitch')
    console.log(1,remainingRequest)
    console.log(2,precedingRequest)
    console.log(3,stringifyRequest(this, '!!' + remainingRequest))
}

// 效果
a-loader pitch
1 /Users/hcl/Desktop/books/node/content/webpack/loader/demo3/b-loader.js!/Users/hcl/Desktop/books/node/content/webpack/loader/demo3/src/index.js
2 
3 "!!../b-loader.js!./index.js"
b-loader pitch
1 /Users/hcl/Desktop/books/node/content/webpack/loader/demo3/src/index.js
2 /Users/hcl/Desktop/books/node/content/webpack/loader/demo3/a-loader.js
3 "!!./index.js"
b-loader normal console.log('index')
a-loader normal console.log('index')
 // 修改自b-loader;

 // 总结：
 // 1、remainingRequest 为：下个loader路径!原文件路径。如果是最后一个loader，则只有：原文件路径
 // 2、precedingRequest 为：上个loader路径。第一个loader没有值
 // 3、stringifyRequest(this, '!!' + remainingRequest)：结果为格式化后的remainingRequest。
 // Normal-loader 或 Pitch-loader 如果返回require('')则这个会被webpack处理。
```
## 三、总结