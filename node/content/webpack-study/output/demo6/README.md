# output其他配置

## 1、iife

```js
// 配置
output:{
    // 默认false,为true可以增加一个命名空间,避免全局污染
    iife:false
}
// 理解：iife形成命名空间，避免全局污染
// 自测：open index.html
// 控制台输出：./dist/main.js中的var变量，发现是可以输出的
// 如：
__webpack_module_cache__
// 输出：
// {1: {…}}1: {exports: Module}__proto__: Object
// __webpack_require__
// ƒ __webpack_require__(moduleId) {
// /******/ 	// Check if module is in cache
// /******/ 	var cachedModule = __webpack_module_cache__[moduleId];
// /******/ 	if (cachedModule !== undefined) {
// /******/ 		return…
```

## 2、clean 清除

清除output目录的之前内容

```js
output:{
    clean:true // Clean the output directory before emit.
}
```

```js
// 对象形式
// dry分析
output:{
    clean:{
        dry: true // Log the assets that should be removed instead of deleting them
    }
}
// 理解：log出来哪些会删除而不是直接delete他们
// 效果
// 运行webpack
// 会输出（LOG from webpack.CleanPlugin\n<i> 123.js will be removed）
$ webpack
asset main.js 3.1 KiB [compared for emit] (name: main)
runtime modules 670 bytes 3 modules
cacheable modules 119 bytes
  ./src/index.js 61 bytes [built] [code generated]
  ./src/module/1.js 58 bytes [built] [code generated]

LOG from webpack.CleanPlugin
<i> 123.js will be removed
```

```js
output:{
    clean:{
        // keep: /ignored\/dir\//, // Keep these assets under 'ignored/dir'.
        keep(asset) {
            // 输出文件名称
            console.log(asset);
            return asset.includes('1');
        },
    }
}
// 理解：也就是正则匹配文件名，符合的留下，不符合的删除
```
