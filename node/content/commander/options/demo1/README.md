# 选项
## 一、语法

```js
// 语法
option('-段名称, --长名称', '描述')
// 如
program.option('-d, --debug', 'output extra debugging')
```
```js
// 获取输入的选项
const options = program.opts();
```

## 二、选项分类
选项的分类：
1、布尔选项
2、带参数选项
3、可选参数选项
```js
// 布尔选项
program.option('-d, --debug', 'output extra debugging')

// 测试 node .src/index -d
// 输出 { debug:true }
```
```js
// 带参数选项
program.option('-p, --pizza-type <type>', 'flavour of pizza')

// 测试 node .src/index -p
// 输出：error: option '-p, --pizza-type <type>' argument missing

// 测试 node .src/index -p 123
// 输出 { pizzaType:'123' }
```
```js
// 可选参数选项
program.option('-c, --cheese [type]', 'Add cheese with optional type')

// 测试 node .src/index -c
// 输出：{ cheese:true }

// 测试 node .src/index -c 123
// 输出: { cheese:'123' }
```

## 三、总结
选项的分类：
1、布尔选项：不带参数，如果输入了选项则为true
2、带参数选项：必须带参数
3、可选参数选项：参数可选，如果不带参数，则转化为布尔选项，如果带参数，则转换为带参数选项