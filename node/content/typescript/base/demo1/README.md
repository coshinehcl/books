# typescript学习笔记

这节我们来看基础类型

## 一、介绍
```js
// js基础类型
// number、string、boolean、null、undefined

// ts类型
// 多了枚举类型
```
```js
// 标记类型方式
let isDone: boolean = false;
let decLiteral: number = 6;
let name: string = "bob";
let u: undefined = undefined;
let n: null = null;
let testNever:never = 2;

// 对于数组
// 1、第一种，可以在元素类型后面接上 []，表示由此类型元素组成的一个数组：
let list: number[] = [1, 2, 3];
// 2、第二种方式是使用数组泛型，Array<元素类型>：
let list: Array<number> = [1, 2, 3];
// 3、元组 Tuple
let x: [string, number] = ['hcl',1]
// 此时，能够推断出index对应位置的类型，及越界的元素，会使用联合类型替代（如上，则 string | number 类型都是支持的）

// 对于对象
// 1、object

// 枚举
enum Color {Red, Green, Blue}
let c: Color = Color.Green;

// 其它
// 1、any 逃生舱 任何类型都可以，也就是避免检查；
// 2、void 它表示没有任何类型。也就是不能有正常值（除undefined、null）。主要用于表示函数没有返回值，或只能返回undefined、null
```

## 三、总结
### 1、类型总结
```js
// ts中的类型
number
string
boolean
void
类型[]、[string,]
object、interface
menu
函数、class等


// ts中的子类型
// 也就是可以赋值给上面的任何类型
any
null
undefined
never
```
### 2、类型标记总结
```js
// 理解
// 在js角度，会有变量的操作（调用方法，语句，表达式）
// 类型，就是约束，该变量，提示使用该类型的方法，或表达式或赋值的约束
// 1、执行方法的约束（提示使用该类型的方法）
// 2、赋值的约束（相同类型或者子类型，才能赋值给左边）
// 3、语句的约束

```
### 3、void 、null、undefined、never的理解
```js
// void 、null、undefined、never的理解

// 我们首先，先不把子类型当成类型，因为这个是js语法问题（任何类型，都可以赋值null、undefined）
// void：表示没有任何类型。只能赋值null和undefined。
// null和undefined我们在js角度可以理解为都是没有值，这里作为类型，也是这个意思，作用差不多
// never标识，不能有任何值，包括null、undefined。

// 当你指定了--strictNullChecks标记，null和undefined只能赋值给void和它们各自
// 也就是区分了null和undefined。
```
