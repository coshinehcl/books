# module

## 一、介绍
这些选项决定了如何处理项目中的不同类型的模块。

```js
{
    noParse:RegExp [RegExp] function(resource) string [string],
    rules:[rule]
}

// 上节，我们分析了noParse
// 这节，我们重点来分析rules
```
## 二、rules:[rule]

```js
// rule概念
// 每个规则可以分为三部分 - 条件(condition)，结果(result)和嵌套规则(nested rule)。

// Rule 条件
// 1、resource：我是哪个资源，资源文件的绝对路径。它已经根据 resolve 规则解析
// 2、issuer：请求者是哪个资源，请求者的文件绝对路径。是导入时的位置
// 如：从 app.js 导入 './style.css'，resource 是 /path/to/style.css. issuer 是 /path/to/app.js
// 在规则中，属性 test, include, exclude 和 resource 对 resource 匹配
// 并且属性 issuer 对 issuer 匹配

// Rule 结果
// 规则结果只在规则条件匹配时使用

// 嵌套的 Rule
// 可以使用属性 rules 和 oneOf 指定嵌套规则。
```
```js
// Loader概念
// 多个loader之间是什么关系呢？洋葱模型
// 所有一个接一个地进入的 loader，都有两个阶段
// 1、Pitching 阶段: loader 上的 pitch 方法，按照 后置(post)、行内(inline)、普通(normal)、前置(pre) 的顺序调用。更多详细信息，请查看 Pitching Loader。
// 2、Normal 阶段: loader 上的 常规方法，按照 前置(pre)、普通(normal)、行内(inline)、后置(post) 的顺序调用。模块源码的转换， 发生在这个阶段。
// 也就是洋葱模型。最外圈是post
```
### 1、条件
```js
//  test, include, exclude 和 resource 对 resource 匹配，并且属性 issuer 对 issuer 匹配
// 也就是可以根据目标资源 和 请求资源 的路径，来作为条件

// 目标资源：
// 绝对路径：resource
// 正则匹配：test、include、exclude

// 请求资源
// 绝对路径：issuer

// 所以，可以
{
    test:RegExp,
    includes:[RegExp,RegExp]
}
{
    test:RegExp,
    exclude:[RegExp,RegExp]
    // includes和exclude不能共存
}
{
    resource:path.resolve(__dirname,'/xx.js')
    // 这个是直接指定资源路径，所以不能和test、includes、exclude共存
}
{
    issuer:path.resolve(__dirname,'/xx.js'),
    // 这个是指定请求路径，也就是在这个入口下，应用规则，这个一般是用于嵌套规则。
    // 如多entry情况下，可能需要区分对待。
}
```
### 2、结果
```js
// 两个部分
// 1、设置:resolve,type
// 2、use loader
```
### 2、嵌套规则
可以使用属性 rules 和 oneOf 指定嵌套规则。

## 三、总结