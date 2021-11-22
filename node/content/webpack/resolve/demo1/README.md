# resolve

## 一、介绍
```js
// 配置模块如何解析。
// 例如，当在 ES2015 中调用 import 'lodash'，
// resolve 选项能够对 webpack 查找 'lodash' 的方式去做修改

module.exports = {
  //...
  resolve: {
    // configuration options
  },
};
```
```js
// 主要配置，也就是处理：如何去解析导入这个语句。
{
    alias:Object, // 配置导入别名
    descriptionFiles:[String] = ['package.json'], // 指定描述的 JSON 文件
    enforceExtension:Boolean, // 如果是 true，将不允许无扩展名文件
    extensions:[String] = ['.js', '.json', '.wasm'], //尝试按顺序解析这些后缀名
    mainFields:[String], // 如果从npm 包中导入。则从package中的哪个哪个字段导入模块
    plugin:[], // 插件
}
```
## 二、测试

## 三、总结