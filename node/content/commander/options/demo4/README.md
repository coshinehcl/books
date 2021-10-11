# 版本选项

## 一、概念
一种特殊的选项，用于标识版本

## 二、语法
```js
// 先看下选项
option('-段名称, --长名称', '描述','默认值')

// 再看下version
version('版本号','-段名称, --长名称', '描述','默认值')
```

## 三、测试

```js
const { program } = require('commander');
program.version('1.2.3','-v1, --ver', '这里是版本描述')
.parse(process.argv)
```

```js
// 测试

// 测试 node ./src/index -v
// 输出 error: unknown option '-v'

// 测试 node ./src/index -v1 或 node ./src/index --ver
// 输出 1.2.3
```

## 四、和选项的区别

```js
1、version是特殊的选项，值是内部设定的，而不是外部输入的；
2、其它选项，可以通过program.opts()来获取输入了什么选项和值，而，version属于内部设置，program.opts()获取不到。
```

## 五、总结
```js
1、version和option有类似的使用
2、但version属于内部配置，option属于外部输入，可以通过program.opts()来获取输入了什么选项和值

```