# noparse

## 完整的module概念描述看demo2

```js
module:{
    // 防止 webpack 解析那些任何与给定正则表达式相匹配的文件,可以提高性能
    // 测试运行webpack，然后观察webpack 5.35.0 compiled successfully in 78 ms这个时间
    noParse: /jquery|lodash/,
}
// 效果对比：
// webpack 5.35.0 compiled successfully in 266 ms
// webpack 5.35.0 compiled successfully in 78 ms
```

```js
// 函数形式
module:{
    noParse:(content)=>{
        // 输出，entry入口的全路径
        console.log(content)
        return 'jquery'
    }
}
// content的作用
// 1、一种是根据该模块，无脑判断需不需要解析
// 2、另外一种就是根据entry入口，看需不需要解析（如：做相同模块提取等）
```
