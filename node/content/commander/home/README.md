# 首页

## 一、介绍
```js
// 这个库是用来处理命令行的

// 如何来理解

// 一、站在输入命令行角度来看
// 输入的可以认为是命令 和 命令参数
// 产生以下概念
// 1、命令
// 2、命令参数：同一个命令参数也可以输入多次
//    选项，可以认为是一种特殊的命令参数，"-" 或 "--开头"
//    为什么需要选项呢？
//        a.我们可以理解为内部设置的特殊参数，如--debug,可以很好的理解是要做什么，以及help时好输出
//        b.选项后面也可以接选项参数
// 3、命中某个命令后的动作，action


// 二、站在命令行友好提示角度看
// 除了上面的，本库还可以友好的提示，有哪些命令，有哪些命令，以及版本等内容
// 还有version、help等概念

// 总之，通过理解上面概念，我们对本库的学习和理解就如鱼得水
```
### 1、相关文档

- [官网地址](https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md)

### 2、阅读顺序
```js
// 1、home: 高屋建瓴的介绍
// 2、command：来介绍command的概念，以及完整结构和注册子命令
//    后序章节，详细的介绍命令的其它配置
// 3、argument：介绍配置
// 4、options：介绍配置
// 5、version：介绍配置
// 6、action: 介绍命中某个命令后的动作
// 7、other: 其它杂项
// 8、end： 一些综合demo
```
  
## 二、概念梳理

### 1、命令command
一份配置读懂command
```js
{
    _name: '', // 命令名称
    _description: '这个是顶层命令的描述',
    _args:[
        // 命令参数
        {
            description: '顶层命令参数1',
            variadic: false,
            parseArg: undefined,
            defaultValue: undefined,
            defaultValueDescription: undefined,
            argChoices: undefined,
            required: true,
            _name: 'arg1'
        }
    ],
    options:[], // 选项
    // 子命令
    commands:[
        // 子命令，也就是树结构
        {
            commands:[], // 子命令，也可以有子命令，也就是形成树状结构
            // 其它属性同外部，略
        }
    ],
    parent:null, // 关系指向
    // 其它属性，略
    // 命令方法
    program: [Circular *1],
    Argument: [class Argument],
    Command: [class Command extends EventEmitter],
    CommanderError: [class CommanderError extends Error],
    Help: [class Help],
    InvalidArgumentError: [class InvalidArgumentError extends CommanderError],
    InvalidOptionArgumentError: [class InvalidArgumentError extends CommanderError],
    Option: [class Option],
}

// 说明：
// 1、命令是树状结构
// 2、命令有很多其它的配置，如命令参数，选项，描述等
```
```js
// 这里是一份较完整的命令
// 涉及注册：命令的描述、命令参数、选项、action注册
// 和注册：子命令
program
  // 顶层命令的描述、命令参数、选项、action注册
  .description('这个是顶层命令的描述')
  .option('-d, --debug', 'output extra debugging')
  // .option('-d, --debug [type...]', 'output extra debugging')
  .argument('<arg1>', '顶层命令参数1')
  .argument('[arg2]', '顶层命令参数2')
  // .argument('[login]', '顶层命令参数2')
  .action(function(source, destination){
    console.log('顶层命令 called',this.opts(),source, destination);
  })
  // 注册子命令
  .command('login <username> [password]')
  .description('登录')
  .action((name, pwd) => {
    console.log('login')
    console.log('username:', name);
    console.log('password:', pwd);
  })

// 说明：子命令的完整结构和上面一致
// 1、思考一个问题，输入 node src/index.js 12 -d 和 node src/index.js -d 12 有区别吗？
//    答案是没有：因为-d，一看就是选项，并且这里-d没有选项参数，那12就是命令参数了，所以没有顺序区别
//    如果-d有参数，如上注释部分，则node src/index.js -d 1 2 3 -- 12
//    则1 2 3为选项参数，12为命令参数

// 2、思考一个问题，如果命令参数和子命令名称一致，则
//   输入 node src/index.js login 则login是选项还是子命令呢？
```

### 2、命令参数argument

一份配置读懂命令参数

```js
// Argument 对象结构为
Argument {
  description: '描述', // 描述
  variadic: false,    // 可变长参数
  parseArg: undefined, // 处理函数
  defaultValue: undefined, // 默认值
  defaultValueDescription: undefined, // 默认值描述
  argChoices: undefined, // 多选1
  required: false,      // 是否是<>
  _name: 'arg1'        // 参数名称
}

// 有以下方法，都是为了配置上面的

// 1、default：设置defaultValue
default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
};

// 2、argParser:设置处理函数
argParser(fn) {
    this.parseArg = fn;
    return this;
};

// 3、choices：设置多选一
choices(values) {
    this.argChoices = values;
    this.parseArg = (arg, previous) => {
        if (!values.includes(arg)) {
        throw new InvalidArgumentError(`Allowed choices are ${values.join(', ')}.`);
        }
        if (this.variadic) {
        return this._concatValue(arg, previous);
        }
        return arg;
    };
    return this;
};

// 4、argRequired：设置为required,<>
argRequired() {
    this.required = true;
    return this;
}

// 5、argOptional:设置非required,[]
argOptional() {
    this.required = false;
    return this;
}

// 6、humanReadableArgName：根据配置，返回参数结构，[xx] / <xx> / [xx...] / <xx...>
function humanReadableArgName(arg) {
  const nameOutput = arg.name() + (arg.variadic === true ? '...' : '');

  return arg.required
    ? '<' + nameOutput + '>'
    : '[' + nameOutput + ']';
}

// 注册方式
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

// 说明
// 1、命令参数是可以输入多次的，相同参数也可以输入多次（理解argParser函数，这里就好理解）
// 2、选项，也可以认为是一种特殊的命令参数，区别是"-"或"--"打头，内部好区分
```
### 3、选项option
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

// 注册方式
// 1、传统配置：program.option('-d, --debug', 'output extra debugging')
// 2、addOption方式配置：program.addOption(new Option('-s, --secret').hideHelp())

// 细节部分，参考命令参数即可
```

### 4、命令动作action
一份配置读懂action

```js
// 说明
// action 和钩子pre/post
// pre和post可以多个
// 子命令执行，也会触发父亲的pre和post

const { Command } = require('commander');
const myCommand = new Command('top')
myCommand
    .option('-t, --trace [arg1]', 'display trace statements for commands')
    .hook('preAction', (thisCommand, actionCommand) => {
        console.log('preAction1执行')
        console.log(thisCommand.name(),actionCommand.name())
    })
    .hook('preAction', (thisCommand, actionCommand) => {
        console.log('preAction2执行')
    })
    .hook('postAction', (thisCommand, actionCommand) => {
        console.log('postAction执行')
    })
    .action(function(arg1,myOption,that){
        console.log('action执行')
    })
    // 这边注册子命令
    .command('clone <source> [destination]')
    .description('clone a repository into a newly created directory')
    .action((source, destination) => {
        console.log('clone command called');
    })
   .parse()

// 测试
// 输入 node src/index clone
// 输出
preAction1执行
top clone
preAction2执行
clone command called
postAction执行

// 重点来关注下top clone
// 也就是：
// 1、thisCommand是当前注册环境的命令
// 2、actionCommand是命中的那个命令

// 同时，我们也知道，子命令也会触发父亲的hooks
```

## 三、其它
```js

// 相似产品
// meow、argparse

// 其它产品
// 1、chalk、cli-color ：console.log带颜色
// 2、ora、progress：进度条
// 3、inquirer、prompts：友好输入
```