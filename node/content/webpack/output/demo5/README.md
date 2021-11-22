# demo5

## 一、介绍
```js
// 配置很多，我们来分类下

// 1、公共配置：path、chunkFormat、pathinfo
// 2、主chunk：filename
// 3、异步chunk:chunkFilename、chunkLoadTimeout、chunkLoadingGlobal、chunkLoading、crossOriginLoading、charset、scriptType
// 4、静态资源：publicPath、assetModuleFilename、
// 4、其它功能：
//      library:library、globalObject
//      sourceMap:sourceMapFilename、sourcePrefix、
//      iife:iife
//      clean:clean

// 这节我们来关注下其它功能
```

## 二、library
```js
// 输出一个库，为你的入口做导出。
// 类型：string | string[] | object

// 如果只有一个entey，我们可以在output这里设置，如果有多个entry。尽量在entry那里配置。

// 
{
    name: String, // 指定库的名称
    type: String, // 配置将库暴露的方式
    export:String | string [], // 指定哪一个导出应该被暴露为一个库默认默认为 undefined，将会导出整个（命名空间）对象
    // 其它略
}
```
### 1、name
```js
output:{
    path:path.resolve('./dist'),
    library:'myLibrary'
}

// 观察打包后（main.js）
var myLibrary;
// 略
myLibrary = __webpack_exports__;
```
### 2、type
```js
// 配置将库暴露的方式。
// 类型默认包括 'var'、'module'、'assign'、'assign-properties'、'this'、'window'、'self'、'global'、'commonjs'、'commonjs2'、'commonjs-module'、'amd'、'amd-require'、'umd'、'umd2'、'jsonp' 以及 'system'，除此之外也可以通过插件添加

// this
this.myLibrary = __webpack_exports__;
// window
window.myLibrary = __webpack_exports__;
// self
self.myLibrary = __webpack_exports__;
// var(默认是这个)
var myLibrary;
myLibrary = __webpack_exports__;
// commonjs
exports.myLibrary = __webpack_exports__;
// umd
if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
else if(typeof define === 'function' && define.amd)
    define([], factory);
else if(typeof exports === 'object')
    exports["myLibrary"] = factory();
else
    root["myLibrary"] = factory();

```
### 3、export
```js
// 指定哪一个导出应该被暴露为一个库。也就是导出，支持只导出局部
// 默认，导出所有

// 默认是：return __webpack_exports__;

output:{
    path:path.resolve('./dist'),
    // library:'myLibrary'
    library:{
        name:'myLibrary',
        type:'umd',
        export:['a','b','c'] // 意思就是，导出所有导出的.a.b.c
    }
}
// 效果
__webpack_exports__ = __webpack_exports__.a.b.c;
return __webpack_exports__;

```
```js
// 总结：
// 导出一个库
// 1、导出名称叫什么：name
// 2、什么类型的导出：type
// 3、导出哪个，支持局部：export
```
## 三、sourceMap前置知识devtool

```js
// 这个和Devtool配置有关，我们先了解下devtool吧
// devtool
// 此选项控制是否生成，以及如何生成 source map。
// false String
// String：有eval,source-map,
module.exports = {
    devtool:false
}
```
### 1、source-map原理
```js
// 在我们代码尾部，加上
//# sourceURL=命名空间:///路径"
// 就能开启sourceURL

// 如
console.log(1);
//# sourceURL=xx:///./src/index.js

// 就会把该代码，放在xx命名空间下的./src/index.js路径下。
// 当然，路径也可以随意写。如yy

// 这种只能定位到哪个文件
```
![avatar](webpack_output_demo5_sourceMap.png)
![avatar](webpack_output_demo5_sourceMap2.png)

### 2、eval
```js
// 效果
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"a\": () => (/* binding */ a),\n/* harmony export */   \"b\": () => (/* binding */ b)\n/* harmony export */ });\nconst a = {\n    name:'hcl',\n    job:'web'\n}\nconst b = {\n    test:'test'\n}\n\n//# sourceURL=webpack:///./src/index.js?");

// 也就是通过eval包裹执行的代码
// 然后加上//# sourceURL=webpack:///./src/index.js?
```

### 3、eval-cheap-source-map
```js
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"a\": () => (/* binding */ a),\n/* harmony export */   \"b\": () => (/* binding */ b)\n/* harmony export */ });\nconst a = {\n    name:'hcl',\n    job:'web'\n}\nconst b = {\n    test:'test'\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzP2I2MzUiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGEgPSB7XG4gICAgbmFtZTonaGNsJyxcbiAgICBqb2I6J3dlYidcbn1cbmV4cG9ydCBjb25zdCBiID0ge1xuICAgIHRlc3Q6J3Rlc3QnXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///0\n");

// 也就是加上sourceMappingURL、sourceURL
// 这样就能定位到哪一行
```
### 3、source-map
```js
// 打包后会打包出一个main.js.map
{"version":3,"file":"main.js","mappings":";;AAAA;AACA,mBAAmB;AACnB;AACA;AACA,I","sources":["webpack:///./src/index1.js"],"sourcesContent":["function xx(){\n    console.log(1);console.log(2);\n    console.log(3)\n}\nxx()"],"names":[],"sourceRoot":""}
// 我们再看下main.js,尾部会加上
//# sourceMappingURL=main.js.map

// 也就是这个是sourceMappingURL。并且把具体内容，放到外面文件
```

### 4、inline-source-map
```js
// 我们观察下打包后main.js,尾部加上了
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQSxJIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4MS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiB4eCgpe1xuICAgIGNvbnNvbGUubG9nKDEpO2NvbnNvbGUubG9nKDIpO1xuICAgIGNvbnNvbGUubG9nKDMpXG59XG54eCgpIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9

// 也就是相对于source-map。这里会把映射放在inline
```

### 5、总结
```js
// 类别很多，我们就不一一举例
// 基本是eval、sourceMap 和inline的组合
```
## 四、sourceMap
```js
// 前面我们有了解develop的配置。
module.exports = {
    mode:'none',
    context:path.resolve(__dirname),
    devtool:'inline-source-map',
}

// 这里我们来看下output中sourceMap的配置
// 1、output.sourceMapFilename
// 2、output.sourcePrefix
```
### 1、sourceMapFilename
```js
// string = '[file].map[query]'
// 仅在 devtool 设置为 'source-map' 时有效，此选项会向硬盘写入一个输出文件

// 我们前面有注意到。设置develop:sourceMap
// 会在我们打包文件后，生成：//# sourceMappingURL=main.js.map
// 然后会生成main.js.map文件
// sourceMapFilename就是来修改这个名称的
```
### 2、sourcePrefix
```js
// string = ''
// 修改输出 bundle 中每行的前缀。
```
## 五、iife
```js
// 告诉 webpack 添加 IIFE 外层包裹生成的代码
// boolean = true

// 默认会添加iife。起到作用域的效果，作用域隔离
```
## 六、clean
```js
// boolean { dry?: boolean, keep?: RegExp | string | ((filename: string) => boolean) }

// 在生成文件之前清空 output 目录
// 1、dry: true, // 打印而不是删除应该移除的静态资源
// 2、keep: /ignored\/dir\//, // 保留 'ignored/dir' 下的静态资源
```

## 总结
```js
// 这里我们重点来分析了下output的其它功能
library:library、globalObject
sourceMap:sourceMapFilename、sourcePrefix、
iife:iife
clean:clean
```
