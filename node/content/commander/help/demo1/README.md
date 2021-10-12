# help帮助信息

## 一、有以下几种情况的帮助

### 1、手动敲console输出

```js
// 测试代码
const test1 = ()=>{
    program
    .description('An application for pizza ordering')
    .option('-p, --peppers', 'Add peppers')
    .option('-c, --cheese <type>', 'Add the specified type of cheese', 'marble')
    .option('-C, --no-cheese', 'You do not want any cheese');

    program.parse();

    const options = program.opts();
    console.log('you ordered a pizza with:');
    if (options.peppers) console.log('  - peppers');
    const cheese = !options.cheese ? 'no' : options.cheese;
    console.log('  - %s cheese', cheese);
}
test1()

// 输入 node src/index
// 输出
you ordered a pizza with:
  - marble cheese
```

### 2、自定义帮助

```js
// 语法
program.addHelpText()

// 源码
addHelpText(position, text) {
    const allowedValues = ['beforeAll', 'before', 'after', 'afterAll'];
    if (!allowedValues.includes(position)) {
        throw new Error(`Unexpected value for position to addHelpText.
    Expecting one of '${allowedValues.join("', '")}'`);
    }
    const helpEvent = `${position}Help`;
    this.on(helpEvent, (context) => {
        let helpStr;
        if (typeof text === 'function') {
        helpStr = text({ error: context.error, command: context.command });
        } else {
        helpStr = text;
        }
        // Ignore falsy value when nothing to output.
        if (helpStr) {
        context.write(`${helpStr}\n`);
        }
    });
    return this;
}
```
```js
// 测试代码
// 测试addHelpText
const test2 = ()=>{
    program
        .option('-f, --foo', 'enable some foo')
        .addHelpText('after',`测试\n换行`)
        .addHelpText('after',()=>{
            return '测试函数'
        })
        .addHelpText('after',(context)=>{
            // context：{ error: context.error, command: context.command }
            return '测试参数'+(context.command === program)
        })
        .parse()
}
test2()

// 输入 node src/index -h
// 输出
Usage: index [options]

Options:
  -f, --foo   enable some foo
  -h, --help  display help for command
测试
换行
测试函数
测试参数true


// 总结：addHelpText
// 1、可以多条
// 2、支持字符串和函数
// 3、函数参数为上下文：{error,command}
```

### 3、错误时的提示

```js
// 语法
program.showHelpAfterError(strOrBoolean)

// 源码
showHelpAfterError(displayHelp = true) {
    if (typeof displayHelp !== 'string') displayHelp = !!displayHelp;
    this._showHelpAfterError = displayHelp;
    return this;
}
```
```js
// 测试代码
// 测试showHelpAfterError
const test3 = ()=>{
    program
        .option('-f, --foo', 'enable some foo')
        .showHelpAfterError() // true / false测试下
        // .showHelpAfterError('add --help for additional information')
        .parse()
}
test3()

// 输入 node src/index -a
// 输出 
error: unknown option '-a'

Usage: index [options]

Options:
  -f, --foo   enable some foo
  -h, --help  display help for command

// 使用 showHelpAfterError(false)
// 输出 error: unknown option '-a'

// 使用 .showHelpAfterError('add --help for additional information')
// 输出 
error: unknown option '-a'
add --help for additional information
```