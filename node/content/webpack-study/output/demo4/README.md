# 异步chunk相关配置

## 1、publicPath：异步资源cdm路径（chunk和asset都是从这里读取）

```js
output:{
    // __webpack_require__.p = "./";
    //var url = __webpack_require__.p + __webpack_require__.u(chunkId);
    // publicPath:'./'
    publicPath:'./test', // 不影响存放位置，都是放在./dist目录下。如上，只是影响加载路径
}
```

## 2、chunkFilename

```js
output:{
    filename:'[name].js',
    publicPath:'./',
    chunkFilename:'[id].asyc.js' // 默认使用 [id].js
}
```

```js
// 支持函数
output:{
    filename:'[name].js',
    publicPath:'./',
    chunkFilename:(pathData)=>{
        //输出该chunk的pathData
        console.log(pathData); 
        // pathData.chunk可以获取到当前异步chunk的chunk信息
        return pathData.chunk.id + '.asyc.js'
    }
}
```

## 3、chunkLoading

加载 chunk 的方法（默认值有 'jsonp' (web)、'import' (ESM)、'importScripts' (WebWorker)、'require' (sync node.js)、'async-node' (async node.js)，还有其他值可由插件添加)。

```js
output:{
    filename:'[name].js',
    publicPath:'./dist/',
    chunkFilename:'[id].asyc.js', // 默认使用 [id].js
    chunkLoadingGlobal:'xx',
    chunkLoading:'require'
}

// 理解：根据环境来配置。默认是jsonp
```

## 4、chunkLoadTimeout

加载异步chunk的超时时间

## 5、chunkLoadingGlobal

```js
webpack 用于加载 chunk 的全局变量
output:{
    filename:'[name].js',
    publicPath:'./dist/',
    chunkFilename:'[id].asyc.js', // 默认使用 [id].js
    chunkLoadingGlobal:'xx'
}

// 然后open index.html看效果
=>
// 默认
// main.js
var chunkLoadingGlobal = self["webpackChunkdemo4"] = self["webpackChunkdemo4"] || [];
// 1.js
(self["webpackChunkdemo4"] = self["webpackChunkdemo4"] || []).push([[1],[

// xx后
// main.js
var chunkLoadingGlobal = self["xx"] = self["xx"] || [];
// 1.js
(self["xx"] = self["xx"] || []).push([[1],[

// 总结：
// webpack 用于加载 chunk 的全局变量
// 作用：避免多个入口或使用别人时的同名
```

## 6、crossOriginLoading

cors相关

## 7、scriptType

这个配置项允许使用自定义 script 类型加载异步 chunk，例如 <script type="module" ...>
如果将 output.module 设置为 true，output.scriptType 将会默认设置为 'module' 而不是 false。
