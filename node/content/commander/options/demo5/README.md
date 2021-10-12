# 自定义选项处理

## 一、概念
```js
// 我们回顾下选项的配置
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
  parseArg: [Function (anonymous)], // 本节重点
  hidden: false,
  argChoices: [ 'small', 'medium', 'large' ]
}

// 也就是选项可以输入多次，parseArg就是用于解析当前或后续本选项的，处理后，得到最终的value
// 可以做什么
// 由上描述，可知
// 1、单次选项解析时，处理当前参数（格式化、提示）
//  如：格式化：parseInt/parseFloat/或自定义的foramtValue
//     提示：如输入不对，等
// 2、多次本选项解析时，还可以拿到上次的value。进而可以叠加处理，也就是拿到了所有的本选项参数，进而可以（格式化，提示）
//  如：格式化：=>[] / 统计选项输入的次数 / 或自定义的骚操作
//     提示：如输入不对，根据前面输入判断第n次输入不符合要求等
```

## 二、测试
这里用传统配置方式和new方式配置的，都来看下效果
```js
const { program,Option,InvalidArgumentError } = require('commander');

function myParseInt(value, dummyPrevious) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}
function increaseVerbosity(dummyValue, previous) {
    return previous + 1;
}
function collect(value, previous) {
    return previous.concat([value]);
}
function commaSeparatedList(value, dummyPrevious) {
    return value.split(',');
}
// 传统方式配置
// program
//   .option('-i, --integer <number>', 'integer argument', myParseInt)
//   .option('-v, --verbose', 'verbosity that can be increased', increaseVerbosity, 0)
//   .option('-c, --collect <value>', 'repeatable value', collect, [])
//   .option('-l, --list <items>', 'comma separated list', commaSeparatedList)
// ;

// new 方式配置（和上面传统方式是一样的，这里只是为了更好的理解demo5）
program
  .addOption(new Option('-i, --integer <number>', 'integer argument').argParser(myParseInt))
  .addOption(new Option('-v, --verbose', 'verbosity that can be increased').argParser(increaseVerbosity).default(0,'默认值'))
  .addOption(new Option('-c, --collect <value>', 'repeatable value').argParser(collect).default([],'默认值'))
  .addOption(new Option('-l, --list <items>', 'comma separated list').argParser(commaSeparatedList))

program.parse();
const options = program.opts();
console.log(options)

// Try the following:
//    node options-custom-processing --integer 2
//    node options-custom-processing --list x,y,z
//    node options-custom-processing -v -v -v
//    node options-custom-processing -c a -c b -c c
```
```js
// 测试

// 测试单次输入的效果
// 输入 node src/index.js -i 12a
// 输出 { collect: [], integer: 12 }
// 输入 node src/index.js -l 1,2,3 
// 输出 { collect: [], list: [ '1', '2', '3' ] }

// 测试输入多次本选项的处理效果
// 输入 node src/index.js -v -v -v 
// 输出 { collect: [], verbose: 3 }
// 输入 node src/index.js -c 1 -c 12 -c 13
// 输出 { collect: [ '1', '12', '13' ] }
```

## 三、总结
用于解析当前参数或多次本选项的参数，得到最终的本选项值，具体技巧和用途见本文概念部分。