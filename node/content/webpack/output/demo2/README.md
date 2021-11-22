# 公共配置

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
//      clear:clear

// 这节我们来关注下公共配置
```
## 二、测试

### 1、path
```js
// string = path.join(process.cwd(), 'dist')
// 略
```
### 2、chunkFormat
```js
// false string: 'array-push' | 'commonjs' | 'module' | <any string>

// 略
// TODO
```
### 3、pathinfo
```js
// 告知 webpack 在 bundle 中引入「所包含模块信息」的相关注释
// boolean  string: 'verbose'

// 测试代码
output:{
    path:path.resolve('./dist'),
    pathinfo:'verbose'
}

// 效果
// 该输出模块，会多一些信息

/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! namespace exports */
/*! export xx [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
```
## 三、总结