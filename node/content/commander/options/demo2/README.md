# 选项默认值
## 一、默认值作用
相当于：如果没有输入这个选项，则program.opts()会返回这个key及默认值


## 二、语法
```js
// 语法
option('-段名称, --长名称', '描述','默认值')
```

## 三、测试
```js
const { program } = require('commander');
// boolen选项
program.option('-d, --debug', 'output extra debugging',false)
// 带参数选项
program.option('-p, --pizza-type <type>', 'flavour of pizza',false)
// 可选参数选项
program.option('-c, --cheese [type]', 'Add cheese with optional type',false)
.parse(process.argv)
const options = program.opts();
console.log(options)
```
```js
// 测试不传参数看效果

// 测试 node ./src/index
// 输出 { debug: false, pizzaType: false, cheese: false }

// 测试 node ./src/index -d
// 输出 { debug: true, pizzaType: false, cheese: false }

// 测试 node ./src/index -p
// 输出 error: option '-p, --pizza-type <type>' argument missing

// 测试 node ./src/index -c
// 输出 { debug: false, pizzaType: false, cheese: true }
```
```js
// 测试换成数字类型 123

// 测试 node ./src/index
// 输出 { pizzaType: 123, cheese: 123 }

// 测试 node ./src/index -d
// 输出 { pizzaType: 123, cheese: 123, debug: 123 }

// 测试 node ./src/index -p
// 输出 error: option '-p, --pizza-type <type>' argument missing


// 测试 node ./src/index -c
// 输出 { pizzaType: 123, cheese: 123 }
```

## 四、总结
1、默认值只是给了一个初始值，对于布尔选项只能接受布尔类型值
2、默认值不影响输入，带参数的还是要输入参数