# 接口

## 一、介绍
```js
// 前面我们有介绍object。但其实我们定义更具体点
// 使用interface来定义个object的具体类型。也就是interface是object的子类型

// interface来定义object类型：
// 1、Object
// 2、Function
// 3、Array
// 4、Map
// 等。
// 也就是描述引用类型

```
## 二、概念
### 1、可选属性
```js
interface SquareConfig {
  color?: string;
  width: number;
}
```
### 2、只读属性

```js
interface SquareConfig {
  readonly color: string;
  width?: number;
}
```
### 3、额外属性检查
```js
// 概念：对于额外的属性，会检查。

xx({color:'red',other:''}); // 如果是对象字面量，则会额外属性检查。
let a = {color:'red',other:''};
xx(a); // 非对象字面量，则不会额外属性检查
```
### 4、字符串索引签名
```js
interface SquareConfig {
    color?: string;
    width?: number;
    [propName: string]: any; // 这里
}
// 如果定义了索引签名。则索引签名的类型描述，是要求其它也要能满足他
// 如
interface SquareConfig {
    color?: string;
    width?: number;
    [propName: string]: string ｜ number | undefined; // 这样color和width就能满足这里的规则了
    // 这里为什么需要undefined呢，因为可选属性。可能会取undefined。
}
```
### 5、继承
```ts
interface Shape {
    color: string;
}

interface PenStroke {
    penWidth: number;
}

interface Square extends Shape, PenStroke {
    sideLength: number;
}
let square = <Square>{};
square.color = "blue";
square.sideLength = 10;
square.penWidth = 5.0;
```
## 三、描述引用类型

interface就是来描述引用类型的

### 1、普通对象类型
```js
// 略，看上面
```
### 2、函数类型
```js
// 函数类型
interface SearchFunc {
  (source: string, subString: string): boolean;
}
```
### 3、可索引的类型
```js
// 类似于字符串索引签名
// 数组我们也可以理解为普通对象，因为key较多，所以使用字符串索引签名
// 同时,这里索引签名支持：字符串和数字
interface StringArray {
  [index: number]: string;
}
```
### 4、类类型
```js
interface ClockInterface {
    currentTime: Date;
}

// 几个重点
// 1、怎么去标记：implements关键字
class Clock implements ClockInterface {
    currentTime: Date;
    constructor(h: number, m: number) { }
}
// 2、检查什么
// 实例public方法（也就是不检查静态方法和private和Protect方法）
// 如果要去标记constructor怎么办，简单啊，走一个函数，
```

## 三、总结3