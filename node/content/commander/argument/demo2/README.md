# 命令参数的addArgument用法

## 一、前面有介绍命令参数的注册方式

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

## 二、这里重点介绍第四种方式

```js
// 测试代码
const { program,Argument, } = require('commander');

console.log(new Argument('[arg1]','描述1'))
program
.addArgument(new Argument('[arg1]','描述1'))
.addArgument(new Argument('[arg2...]','描述2').default(20,'默认值描述'))
.parse(process.argv)

```

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
```

## 三、总结

```txt
站在命令行输入的角度看，输入的可以区分为命令 和 命令参数
则选项是一种特殊的命令参数
```