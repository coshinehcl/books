# 异步chunk配置

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

// 这节我们来关注异步chunk配置
```

## 二、测试
```js
// 测试代码

// index.js
console.log('index');
setTimeout(() => {
    import('./other.js').then(res => {
        console.log('加载成功')
    }) 
}, 5000);
```
### 1、chunkFilename

```js
// 此选项决定了非初始（non-initial）chunk 文件的名称
// 默认使用 [id].js

// 测试
output:{
    // chunkFilename,默认使用 [id].js
    chunkFilename:'[id].other.js'
}

// 效果
asset 1.other.js 132 bytes [emitted]

// 说明
// 打包后细节（main.js中）
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".other.js";
/******/ 		};
/******/ 	})();
```

### 2、chunkLoadTimeout
```js
// chunk 请求到期之前的毫秒数，默认为 120000,也就是120秒，2分钟

// 测试
output:{
    // chunkFilename,默认使用 [id].js
    chunkLoadTimeout:2000, 
}
// 然后我们浏览器限速，看下效果
```
![avatar](webpack_output_demo2_timeout.png)
```js
// 我们再看下打包后细节
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			;
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 2000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);

// 也就是加载我们scipt后，如果onerror或者onload或者超时都会进入，onScriptComplete
// onScriptComplete会移除script。（虽然或许已经在加载中）

// 简单理解：超时丢弃（提醒）
```

### 3、chunkLoadingGlobal
```js
// webpack 用于加载 chunk 的全局变量
// string = 'webpackChunk'

// 因为是会挂载到self上的，如果不想同名，则可以换个名字
```
```js
// 关注下1.other.js

// 默认
(self["webpackChunk"] = self["webpackChunk"] || []).push([[1],[
/* 0 */,
/* 1 */
/***/ (() => {

console.log('other')

/***/ })
]]);

// 修改chunkLoadingGlobal: 'myCustomFunc'后
(self["myCustomFunc"] = self["myCustomFunc"] || []).push([[1],[
/* 0 */,
/* 1 */
/***/ (() => {

console.log('other')

/***/ })
]]);
```
```js
// 关注下打包后细节（main.js）
var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];

// 也就是如果self["webpackChunk"]，有值，如我们在index.js中：window.webpackChunk = 'hcl'。
// 则1.other.js执行时就会出错。

// 我们换个名字
// 则会生成
var chunkLoadingGlobal = self["myCustomFunc"] = self["myCustomFunc"] || [];
```
![avatar](webpack_output_chunkLoadingGlobal.png)

### 4、chunkLoading
```js
// 加载 chunk 的方法
// （默认值有 'jsonp' (web)、'import' (ESM)、'importScripts' (WebWorker)、'require' (sync node.js)、'async-node' (async node.js)，还有其他值可由插件添加)。

// target：web。默认为jsonp
```

### 5、crossOriginLoading
```js
// 告诉 webpack 启用 cross-origin 属性 加载 chunk。
// 仅在 target 设置为 'web' 时生效，通过使用 JSONP 来添加脚本标签，实现按需加载模块
// boolean = false string: 'anonymous' | 'use-credentials'

// 普通script就支持跨域，这里这个配置就是使用我们定义的cors来加载

// 1、在html的标签中，有些标签时自带跨域功能的，比如上边提到的audio  img link  script  video 标签，他们的src属性可以是任意源的链接，并且均可以进行加载

// 2、但是如果在标签中添加了anonymous属性，那么浏览器再去解析这些跨域资源的时候，就不会以它的自带跨域功能去加载了，而是 使用CORS的方式加载，就像我们的ajax一样，需要服务器设置跨域头，才可以完成加载，否则会报跨域问题，导致加载失败

// 3、设置了anonymous属性。
// 加载时，onerror的时候，我们可以获取该脚本内的具体错误信息，而不是script error。！！！
// 执行时，当然，执行时候的出错我们还是可以获取到的。
```

### 6、charset
```js
// 告诉 webpack 为 HTML 的 <script> 标签添加 charset="utf-8" 标识。
// boolean = true

// 略
```

### 7、scriptType
```js
// 这个配置项允许使用自定义 script 类型加载异步 chunk，例如 <script type="module" ...>
// string: 'module' | 'text/javascript' boolean = false

// 关注下打包后代码（main.js）
/******/ 				script = document.createElement('script');
/******/ 				script.type = "module";
/******/ 				script.charset = 'utf-8';

// 略
```
## 三、总结
```js
// 围绕异步加载。有几方面的设置

// 1、chunk名称：chunkFilename
// 2、全局加载器名称：chunkLoadingGlobal
// 3、加载器：chunkLoading
// 4、script相关的：scriptType、charset、crossOriginLoading、chunkLoadTimeout
```