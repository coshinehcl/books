# context

## 一、介绍

```js
// string

// 基础目录，绝对路径，用于从配置中解析入口点(entry point)和 加载器(loader)。
// 默认：cwd
// 也就是相对路径，是相对于这里
```
## 二、测试

```js
const path = require('path');
module.exports = {
    mode:'none',
    context:path.resolve(__dirname,'./src'), // 默认path.resolve(__dirname)
    entry:'./index.js'
}
// 后续其它相对路径，也是相对于这个context。我们接触到会测试这点
```
## 三、总结