# addOption方式配置选项

## 一、概念
除了传统的配置，我们还可以通过addOption的方式来配置。可以更好的控制我们要的配置

## 二、语法

```js
// 传统方式配置选项
program.option('-d, --debug', 'output extra debugging')

// addOption方式配置选项
program.addOption(new Option('-s, --secret').hideHelp())
```

## 三、测试

```js
const { program,Option } = require('commander');
// new 方式配置选项
program.addOption(new Option('-s, --secret').hideHelp())
.addOption(new Option('-s, --secret').hideHelp())
.addOption(new Option('-t, --timeout <delay>', 'timeout in seconds').default(60, 'one minute'))
.addOption(new Option('-d, --drink <size>', 'drink cup size').choices(['small', 'medium', 'large']))
.addOption(new Option('-p, --port <number>', 'port number').env('PORT'))
.parse(process.argv)
console.log('Options: ', program.opts());
```

```js
// 测试

// 输入 node src/index.js -h
// 输出  // 略
// 总结 '-s, --secret' 选项在help中不会提示出来了！！！hideHelp起作用了

// 输入 node src/index.js -t
// 输出  Options:  { timeout: 60 }
// 总结 default 设置默认值起作用了

// 输入 node src/index.js -d xx
// 输出 error: option '-d, --drink <size>' argument 'xx' is invalid. Allowed choices are small, medium, large.
// 总结 choices只能在指定中选项，起作用了

// 更多方法，参考下文拓展部分，或者看Option源码
```

## 四、总结

```js
// 由上可知
new Option('-短选项名, --长选项名 [参数]','描述')
// 会创建一个普通的选项
// 但是后续可以接方法，进而对选项改造成特殊的选项。
```

## 五、拓展

```js
// 测试

// 打印new Option('-短选项名, --长选项名 [参数]','描述')
// 会发现，打印出来的是以下对象

{
  flags: '-d, --drink <size>',
  description: 'drink cup size',
  required: true,
  optional: false,
  variadic: false,
  mandatory: false,
  short: '-d',
  long: '--drink',
  negate: false,
  defaultValue: undefined,
  defaultValueDescription: undefined,
  envVar: undefined,
  parseArg: [Function (anonymous)],
  hidden: false,
  argChoices: [ 'small', 'medium', 'large' ]
}

// 也就是选项，有这些属性，我们前面的配置，以及这里的new Option()都是为了生成这个配置。
// 认真看下这个配置的属性，也就明白了选项的配置了
```