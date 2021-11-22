# cache

## 一、介绍
```js
// 缓存生成的 webpack 模块和 chunk，来改善构建速度

// cache:boolean object

// 1、开发模式下，默认memory
// 2、生产模式下，默认false

module.exports = {
    // cache:false
    cache:{
        type:'memory', // 存储方式，有内存和文件系统两种
    }
}

// type:'memory' 不允许额外的配置
// type:'filesystem' 有其它配置

// 总结：
// 1、不允许缓存
cache:false
// 2、内存缓存
cache:{
    type:'memory'
}
// 3、文件缓存
cache:{
    type:'filesystem',
    // 其它配置
    cacheDirectory:'node_modules/.cache/webpack', // 缓存目录，默认当前路径下的node_modules/.cache/webpack
    name:String, // 缓存name 
    cacheLocation:path.resolve(cache.cacheDirectory, cache.name), // 缓存路径
    compression:false | 'gzip' | 'brotli' // 压缩类型
    maxAge:number = 5184000000, // 缓存保留时间，默认一个月
}
```

## 二、测试

## 三、总结