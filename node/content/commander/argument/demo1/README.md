# 命令参数argument

## 一、概念
命令的一个配置项

## 二、命令参数的注册方式

```js
// 方式一
program
  .command('clone <source> [destination]')

// 方式二
program
  .argument('<username>', 'user to login')
  .argument('<password>', 'password to login')

// 方式三
program
  .arguments('<username> <password>');

// 方式四
program
  .addArgument(new commander.Argument('<drink-size>', 'drink cup size').choices(['small', 'medium', 'large']))
  .addArgument(new commander.Argument('[timeout]', 'timeout in seconds').default(60, 'one minute'))
```

## 三、对比选项注册方式

```js
// 传统方式配置选项
program.option('-d, --debug', 'output extra debugging')

// addOption方式配置选项
program.addOption(new Option('-s, --secret').hideHelp())
```

## 四、总结

```js
// 选项和命令参数，都是命令的配置
// 从这里看，注册方式有相似之处
// 同时，命令参数也有选项参数的相似性，选项参数有的这里也有，如[],<>,...。及特殊addArgument

// 所以
// 1、注册方式类似于选项
// 2、具体用法类似于选项参数
```