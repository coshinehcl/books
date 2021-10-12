# 注册子命令参数详解.command()

## 一、语法

```js
// 前面有介绍.command()的使用，并没有详细描述其形参

// 源码：
/*
* @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
* @param {Object|string} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
* @param {Object} [execOpts] - configuration options (for executable)
* @return {Command} returns new command for action handler, or `this` for executable command
*/
command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
    // 略
}

// 解释下：
// 1、nameAndArgs：命令名称和命令参数，如'clone [arg1] <arg2> [arg3...]'
// 2、actionOptsOrExecDesc：命令选项 或者 description（命令描述）
//    注意这里的命令选项和option不是一个概念，可以配置哪些选项，后面会细说
//    如果配置的是命令选项，program.command('clone <source> [destination]',{}),则为普通方式注册
//    如果配置的是命令描述，program.command('start <service>', 'start named service')，则为通过独立的的可执行文件实现命令
//  3、execOpts：命令选项，概念如上，此时，是为为通过独立的的可执行文件实现命令
//  4、return：返回，如果是普通注册，返回子命令，如果是独立可执行命令注册，返回顶层命令
```

## 二、命令选项execOpts

```js
// 命令选项，有哪些配置呢？

// 源码：
if (opts.isDefault) this._defaultCommandName = cmd._name;
cmd._hidden = !!(opts.noHelp || opts.hidden); // noHelp is deprecated old name for hidden
cmd._executableFile = opts.executableFile || null; // Custom name for executable file, set missing to null to match constructor

// 解释下：
// 1、isDefault：配置是否是默认命令
// 2、noHelp / hidden：help时不提示
// 3、executableFile：显示设置执行路径
```

## 三、测试命令选项

### 1、测试 isDefault、hidden
```js
// 测试 isDefault、hidden
program
.command('login <username> [password]',{hidden:true})
.action(()=>{
    console.log('登录')
})

program
.command('logout',{isDefault:true})
.action(()=>{
    console.log('登出')
})

program
.command('other')
.action(()=>{
    console.log('其它')
})

program.parse()

// 输入 node src/index.js -h
// 输出
Usage: index [options] [command]

Options:
  -h, --help      display help for command

Commands:
  logout
  help [command]  display help for command
// 也即是hidden起作用了

// 输入 node src/index.js
// 输出 登出
// 也就是isDefault起作用了
```

### 2、测试executableFile

```js
// 这个只是针对通过独立的的可执行文件实现命令
// program.command('start <service>', 'start named service',{executableFile:'',isDefault:true})

program.command('login <arg1>', 'login描述',{executableFile:path.resolve(__dirname,'loginxx.js')})
program.command('logout <agr1>', 'logout描述',{executableFile:path.resolve(__dirname,'logoutyy.js'),isDefault:true})
program.command('other <agr1>', 'other描述',{executableFile:path.resolve(__dirname,'otherzz.js')})

program.parse()

// 说明：executableFile值是：执行文件的路径

// 测试 node src/index 1
// 输出
logout callee [
  '/opt/homebrew/Cellar/node/16.9.1/bin/node',
  '/Users/hcl/Desktop/books/node/content/commander/command/demo3/src/logoutyy.js',
  '1'
]
```

## 三、总结
加深对命令注册的理解，和命令选项的使用

```js
// 1、isDefault：配置是否是默认命令
// 2、noHelp / hidden：help时不提示
// 3、executableFile：显示设置执行路径
```