# 首页

## 一、官网
[官网地址](https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md)
  
## 二、概念梳理

### 1、选项option
一份配置读懂选项
```js
{
  flags: '-d, --drink <size>', // flag。用于-h时候的打印输出
  description: 'drink cup size', // 配置的描述，用于-h时候的打印输出
  required: true, // 必须选项
  optional: false,
  variadic: false,
  mandatory: false,
  short: '-d', // 短名称，根据flags解析出来的
  long: '--drink',// 长名称，根据flags解析出来的
  negate: false,
  defaultValue: undefined,// 默认值，根据配置解析出来的
  defaultValueDescription: undefined, // 默认值描述，根据配置解析出来的
  envVar: undefined,
  parseArg: [Function (anonymous)], // 选项处理函数
  hidden: false, // -h的时候，是否隐藏该选项不展示出来。
  argChoices: [ 'small', 'medium', 'large' ] // 用于参数指定输入范围
}

// 配置方式
// 1、传统配置：program.option('-d, --debug', 'output extra debugging')
// 2、addOption方式配置：program.addOption(new Option('-s, --secret').hideHelp())

// 选项可以多个，同一个选项也可以输入多次
```

### 2、命令command
```js

```


## 三、总结