# action的钩子hook

## 一、概念
```js
// 类似于其它的，如run-script,也有pre和post钩子
// 这里也是一样的
```
## 二、源码

```js
hook(event, listener) {
    const allowedValues = ['preAction', 'postAction'];
    if (!allowedValues.includes(event)) {
      throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    if (this._lifeCycleHooks[event]) {
      this._lifeCycleHooks[event].push(listener);
    } else {
      this._lifeCycleHooks[event] = [listener];
    }
    return this;
}

// 很好理解：
// 1、只允许preAction、postAction
// 2、允许多个

// 控制这个顺序的代码
actionResult = this._chainOrCallHooks(actionResult, 'preAction');
actionResult = this._chainOrCall(actionResult, () => this._actionHandler(this.processedArgs));
if (this.parent) this.parent.emit(commandEvent, operands, unknown); // legacy
actionResult = this._chainOrCallHooks(actionResult, 'postAction');
```

## 三、测试

### 1、测试pre、post效果
```js
const { program } = require('commander');
program
    .option('-t, --trace [arg1]', 'display trace statements for commands')
    .hook('preAction', (thisCommand, actionCommand) => {
        console.log('preAction1执行')
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
   .parse()
```

```js
// 测试

// 输入 node src/index
// 输出
preAction1执行
preAction2执行
action执行
postAction执行

// 也就是pre和post起作用来。并且是可以多个的
```
### 2、测试形参
```js
// 测试形参
// 为了更好的理解thisCommand和actionCommand
// 这边注册了个子命令

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
```
```js
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