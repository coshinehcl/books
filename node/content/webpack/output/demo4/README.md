# demo4

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

// 这节我们来关注下静态资源
```

## 二、测试

### 1、publicPath
```js
// 对于按需加载(on-demand-load)
// 或加载外部资源(external resources)（如图片、文件等）来说，
// output.publicPath 是很重要的选项。如果指定了一个错误的值，则在加载这些资源时会收到 404 错误

// 理解:相对于cdn
```

### 2、assetModuleFilename
```js
// 与 output.filename 相同，不过应用于 Asset Modules。
// string = '[hash][ext][query]'

// index.js
import img from './1.png'
console.log('index.js',img);

// 默认输出


output:{
    path:path.resolve('./dist'),
    assetModuleFilename:'[name][ext]'
}

// 输出
// asset 1.png 101 KiB [emitted] [from: src/1.png] (auxiliary name: main)
```
![avatar](webpack_output_demo4_assetModuleFilename.png)

## 三、总结