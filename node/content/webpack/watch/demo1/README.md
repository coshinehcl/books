# watch

## 一、介绍
```js
// 启用 Watch 模式。这意味着在初始构建之后，webpack 将继续监听任何已解析文件的更改

// watch:boolean = false
// 如果配置了true，则通过watchOptions来配置选项
// watchOptions:{}

// 监听（默认） 和 轮询 两种
watchOptions:{
    // 通用配置
    ignore:RegExp string [string], // 排除watch的路径
    // 监听的配置
    aggregateTimeout: 600,// 防抖
    // 轮询的配置
    poll: 1000, // 每秒检查一次变动
}
```

## 二、测试

## 三、总结