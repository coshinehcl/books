# entry

## 一、介绍

```js
// 1、String  // 入口文件路径，如 './src/index.js'
// 2、Array   // 入口文件路径数组 如['./src/index.js','./src/other.js']

// 先总结下
// 会打包成一个chunk。chunk 会被命名为 main。
// 如果是数组，则会把这些入口的各自依赖，打包在一起。


// 3、Object  

// 这里我们来介绍下Object
// 如果传入一个对象，每个属性的键(key)会是 chunk 的名称
// 对象的属性的值可以是一个字符串、字符串数组或者一个描述符(descriptor):
entry:{
    home: './home.js', // 字符串类型
    shared: ['react', 'react-dom', 'redux', 'react-redux'], // 字符串数组
    catalog: { // 描述符对象
      import: './catalog.js',
      filename: 'pages/catalog.js',
      dependOn: 'shared',
    },
}
```

## 二、测试

### 1、我们先来看多个key的情况
```js
// 测试多个key
entry:{
    index:'./src/index.js',
    other:'./src/other.js'
}
```
```js
// 输出两个chunk
asset index.js 104 bytes [emitted] (name: index)
asset other.js 104 bytes [emitted] (name: other)

// index.js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
console.log('index')
/******/ })()
;

// other.js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
console.log('other')
/******/ })()
;
```

### 2、字符串类型
```js
const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    entry:{
        main:'./src/index.js'
    }
}
```
```js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
console.log('index')
/******/ })()
;

// 说明
// entry:'./src/index.js'
// 等同于 
// entry:{main:'./src/index.js'}
```
### 3、字符串数组
```js
// 字符串数组
entry:{
    main:['./src/index.js','./src/other.js']
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

// 说明
// entry:['./src/index.js','./src/other.js']
// 等同于
// entry:{main:['./src/index.js','./src/other.js']}
```
### 3、描述符对象
```js
// {}
// 用于描述入口的对象。你可以使用如下属性：
dependOn: 当前入口所依赖的入口。它们必须在该入口被加载前被加载。

filename: 指定要输出的文件名称。

import: 启动时需加载的模块。

library: 指定 library 选项，为当前 entry 构建一个 library。

runtime: 运行时 chunk 的名字。如果设置了，就会创建一个新的运行时 chunk。在 webpack 5.43.0 之后可将其设为 false 以避免一个新的运行时 chunk。

publicPath: 当该入口的输出文件在浏览器中被引用时，为它们指定一个公共 URL 地址。请查看 output.publicPath。

// 内容比较多。我们下个目录介绍
```

## 三、描述符对象

### 1、dependOn
```js
// 默认情况下，每个入口 chunk 保存了全部其用的模块(modules)。
// 使用 dependOn 选项你可以与另一个入口 chunk 共享模块

// 测试例子
// index.js 依赖 common.js / common1.js
// other.js 依赖 common.js / common1.js

// 测试dependOn
entry:{
    index:'./src/index.js',
    other:{
        import:'./src/other.js',
        dependOn:'index' // 这个值，只能是entry key !!!
    }
}

// 效果：
// other.js中。会把index相交那部分依赖，不会直接打包进来
// 而是：self["webpackChunk"] 去读取

// dependOn 选项的也可以为字符串数组
// 如
entry:{
    index:'./src/index.js',
    other:{
        import:'./src/other.js',
        dependOn:['index','cdn'] // 这个值，只能是entry key !!!
    },
    cdn:['vue','jquery']
}
// 则,other不会包含vue,jquery，和index的部分。

// 说明：
// 1、可以减少打包后的代码
// 2、可以把库等文件，剔除出去
```

### 2、filename
```js
// 默认情况下，入口 chunk 的输出文件名是从 output.filename 中提取出来的
// 但你可以为特定的入口指定一个自定义的输出文件名

// 测试filename
entry:{
    index:{
        import:'./src/index.js',
        filename:'[name].11.js'
    }
}
// 输出 asset index.11.js 285 KiB [emitted] (name: index)
// 说明，这里filename也支持name等格式化格式
```

### 3、library
```js
// 输出一个库，为你的入口做导出

// 测试library
entry:{
    index:{
        import:'./src/index.js',
        library: {
            type:'window',
            name: 'MyLibrary',
        }
    }
}
```
```js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
// import './common'
// import './common1'
// import 'jquery'
console.log('index')
window.MyLibrary = __webpack_exports__;
/******/ })()
;
```

### 4、runtime

```js
// runtime: 运行时 chunk 的名字。
// 如果设置了，就会创建一个新的运行时 chunk。
// 在 webpack 5.43.0 之后可将其设为 false 以避免一个新的运行时 chunk。

// 测试runtime
entry:{
    index:{
        import:'./src/index.js',
        runtime:'hello'
    },
    other:{
        import:'./src/other.js',
        runtime:'hello1'
    }
}

// 效果：会把运行时，作为一个chunk打包出去。
```

### 5、publicPath
```js
// 当该入口的输出文件在浏览器中被引用时，为它们指定一个公共 URL 地址。
// 请查看 output.publicPath。

// 也就是，针对每个entry可以设置自己的publicPath了
```

## 三、总结

```js
// 一、entry格式：
// 1、String
// 2、Array
// 3、Object
// 4、Function  支持promise
// 我们可以认为就是Object。String 和 Array 是简写 。Function 最终结果也是如上

// 二、描述符对象
// 其中有些是output的，因为output中配置是针对所有的入口的。所以这边也能配置
// 如：filename、library、publicPath
// 还有些是增强entry的，如dependOn、runtime
```