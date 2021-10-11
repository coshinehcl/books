# 变长参数

## 一、语法
```js
// 根据前面，可知，选项有布尔选项、带参数选项、可选选项三种类型。
// 带参数选项和可选选项，的参数，是可以变长的。语法为：
program
  .option('-n, --number <numbers...>', 'specify numbers')
  .option('-l, --letter [letters...]', 'specify letters');

// 变长参数，截止到解析到下一个选项前（‘-’或‘--’）
```

# 三、测试
```js
const { program } = require('commander');
// boolen选项
program.option('-d, --debug', 'output extra debugging',123)
// 带参数选项
program.option('-p, --pizza-type <type...>', 'flavour of pizza',123)
// 可选参数选项
program.option('-c, --cheese [type...]', 'Add cheese with optional type',123)
.parse(process.argv)
const options = program.opts();
console.log(options)
```
```js
// 测试

// 测试 node ./src/index -d  a b c
// 输出 { pizzaType: 123, cheese: 123, debug: 123 }
// 也就是不起作用

// 测试 node ./src/index -p
// 输出 { pizzaType: [ 'a', 'b', 'c' ], cheese: 123 }

// 测试 node ./src/index -c
// 输出 { pizzaType: 123, cheese: [ 'a', 'b', 'c' ] }
```

# 四、总结
1、可变参数，可以让接收参数的选项，可以接收多个参数
2、解析后会以数组形式存储在对应属性字段中
![avatar](1.png)
