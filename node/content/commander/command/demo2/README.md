# 子命令注册方式
demo1有描述，这里重点来分析和测试下

## 一、注册方式

```js
// 从前面demo1可知，命令有三种注册方式

// 方式一：普通方式
program
  .command('clone <source> [destination]')
  .description('clone a repository into a newly created directory')
  .action((source, destination) => {
    console.log('clone command called');
});
// 依次注册命令名称/命令参数，命令描述，和后续动作

// 方式二、addCommand的方式
childCommand = new commander.Command('hh');
childCommand
    .command('jug')
    .description('jup description')
    .action(() => {
      console.log('heat jug');
    });
program.addCommand(childCommand)

// 和方式一注册方式一样
// 这种方式，方便使用已有的命令

// 方式三、通过独立的的可执行文件实现命令
program
  .command('start <service>', 'start named service')
  .command('stop [service]', 'stop named service, or all if no name supplied');
// 命令名称，命令描述，一起注册进去（第一参数，第二参数）
// action不需要，直接会执行相关文件
```

## 二、测试

```js
const { program,Command,addCommand } = require('commander');

// 方式一
const test1 = (myCommand)=>{
    myCommand
    .command('login <username> [password]')
    .description('登录')
    .action((name, pwd) => {
        console.log('login')
        console.log('username:', name);
        console.log('password:', pwd);
    })
    myCommand
    .command('logout')
    .description('登出')
    .action(() => {
        console.log('logout')
    }) 
    // 这边直接是解析顶层命令，不要在子命令后面解析，这样解析的是子命令。
    return myCommand;
}

// 方式二、addCommand的方式
const test2 = () => {
    const myCommand = new Command();
    // 子命令本身的name,描述和命令参数
    const childComand = new Command('child').description('child描述').argument('[子命令]', 'child参数')
    myCommand.addCommand(test1(childComand))
    return myCommand;
}

// 方式三、通过独立的的可执行文件实现命令
// 此时，需要index-login和index-logout文件
const test3 = () => {
    program
    .command('login <username> [password]','登录')
    .command('logout','登出')
    return program
}

// 测试

// 测试test1
const myCommand = test1(program);

// 测试test2
// const myCommand = test3();
myCommand.parse()
```
```js
// 测试代码细节说明：
// 1、program= new Command();也就是默认的命令，其它命令需要自己new Command()来获得
// 2、对于new Command()，顶层命令，不需要name，其它命令，需要name，作为命令名称
// 3、.command()和addCommand()都是注册子命令。子命令都需要name，以及可选的描述，命令参数
// 4、action参数和命令参数是一致的，也就是如需要<username> [password],则接受参数也为这个顺序
// 5、通过独立的的可执行文件实现命令，需要额外的文件,文件名为："index-子命令名称"
// 6、通过独立的的可执行文件实现命令，相当于执行了child_process.spawn，此时，参数可以通过process.argv获得
```

```js
// 测试

// 测试方式一
// 输入 node src/index.js -h
// 输出
Usage: index [options] [command]

Options:
  -h, --help                   display help for command

Commands:
  login <username> [password]  登录
  logout                       登出
  help [command]               display help for command
// 输入 node src/index.js login hcl 123
// 输出
login
username: hcl
password: 123

// 测试方式二
// 输入 node src/index.js -h
// 输出
Usage: index [options] [command]

Options:
  -h, --help      display help for command

Commands:
  child [子命令]     child描述
  help [command]  display help for command
// 输入 node src/index.js child -h
// 输出
Usage: index child [options] [command] [子命令]

child描述

Arguments:
  子命令                          child参数

Options:
  -h, --help                   display help for command

Commands:
  login <username> [password]  登录
  logout                       登出
  help [command]               display help for command
// 说明，也就是可以查看子命令的help
// 输入 node src/index.js child login hcl 123
// 输出
login
username: hcl
password: 123

// 测试方式三
// 输入 node src/index.js login hcl 123
// 输出
登录 [
  '/opt/homebrew/Cellar/node/16.9.1/bin/node',
  '/Users/hcl/Desktop/books/node/content/commander/command/demo2/src/index-login.js',
  'hcl',
  '123'
]
// 也就是执行了index-login文件
```

## 三、总结

```js
// 子命令注册方式有三种
// 1、普通方式：
myCommand.command('子命令名称 [参数]').description('描述').action(()=>{});
// 2、addCommand的方式：
myCommand.addCommand(childCommand); // childCommand可配置自身参数描述和子命令
// 3、通过独立的的可执行文件实现命令：
myCommand.command('子命令名称 [参数]','描述') // action为外部文件："index-子命令名称"
```

```js
// 概念重申：
// 先看下以下代码
const test4 = () => {
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
    return program
    // 这部分，代码，用来思考命令选项参数，命令参数，子命令名称之间的匹配逻辑
    // 这个会在后续demo重点来分析
    // .option('-d, --debug [type...]', 'output extra debugging')
    // .argument('[login]', '顶层命令参数2')
}

// 测试test4
// 输入：node src/index.js -h
// 输出
Usage: index [options] [command] <arg1> [arg2]

这个是顶层命令的描述

Arguments:
  arg1                         顶层命令参数1
  arg2                         顶层命令参数2

Options:
  -d, --debug                  output extra debugging
  -h, --help                   display help for command

Commands:
  login <username> [password]  登录

// 重点观察
// 这个是顶层命令的描述
// Arguments
// Options
// Commands

// 或者输出console.log(myCommand)观察下
// 可知，一个命令的结构为：
{
    commands:[
        // 子命令
        {
            // 子命令，也就是树结构
            commands:[],
            // 其它属性同外部，这里略
        }
    ],
    options:[], // 选项
    parent:null, // 关系指向
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
    _name: '', // 命令名称
    _description: '这个是顶层命令的描述',
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
```