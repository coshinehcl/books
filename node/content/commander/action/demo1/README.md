# 命令动作action

## 一、概念

```js
// 我们命令行输入一些字符，这边commander解析出来了各种东西：命令、命令参数、选项等
// 关键是，解析出来后，要做事情啊，执行某个代码，也就是这里的action
```

## 二、语法

```js
// 源码
 action(fn) {
    const listener = (args) => {
      // The .action callback takes an extra parameter which is the command or options.
      const expectedArgsCount = this._args.length;
      const actionArgs = args.slice(0, expectedArgsCount);
      if (this._storeOptionsAsProperties) {
        actionArgs[expectedArgsCount] = this; // backwards compatible "options"
      } else {
        actionArgs[expectedArgsCount] = this.opts();
      }
      actionArgs.push(this);

      return fn.apply(this, actionArgs);
    };
    this._actionHandler = listener;
    return this;
  };

// 解读
fn.apply(this, actionArgs);

// 1、也就是fn是this执行的，如果不是箭头函数，则this可以获取到当前命令对象
// 2、参数为actionArgs

// (前几个是命令参数,接着是this.opts()或this,接着是this)

// 源码中的_storeOptionsAsProperties在other章节会重点介绍
```

## 三、测试

```js
// 测试代码
const { program,Argument} = require('commander');
const { version } = require('less');

program
.version('1.2.3','-v1, --ver', '这里是版本描述')
.option('-d, --debug', 'output extra debugging')
// 带参数选项
.option('-p, --pizza-type <type>', 'flavour of pizza')
// 可选参数选项
.option('-c, --cheese [type]', 'Add cheese with optional type')
// 命令参数
.addArgument(new Argument('[arg1]','描述1'))
.addArgument(new Argument('[arg2...]','描述2').default(20,'默认值描述'))
.action(function(arg1,arg2List,myOption,that){
    console.log(arg1,arg2List)
    console.log(myOption,myOption === program.opts(),that === program)
})
.parse(process.argv)

// 测试
// 输入 node src/index 1 2 3 -p 12 -c 13
// 输出
1 [ '2', '3' ]
{ pizzaType: '12', cheese: '13' } true true

// 说明：
// 1、action(fn)，fn我们也可以使用箭头函数，注意此时我们需要从参数那里获取this。内部获取到的是不对的
```