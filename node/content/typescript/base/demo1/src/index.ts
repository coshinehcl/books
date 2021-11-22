// 基本类型
let isDone: boolean = false;
let decLiteral: number = 6;
let name: string = "bob";
let u: undefined = undefined;
let n: null = null; 
let testany:any;

// 测试基本类型
decLiteral.toFixed();
name=testany;
name.substr();  // 也就是只能使用该类型上面的方法
u = null; u = 2;    // 只能赋值null或undefined 
n = undefined;n=2;  // 只能赋值null或undefined 
let testNever:never; // 也就是不能有值
testNever = testany;



// 数组类型
const arr1:number[] = [1,'',2]; // 必须是number类型
const arr2:any[] = [1,'',2]; // 支持任意类型
const arr3:Array<any> = ['',2]; // 这个是另外一种定义方式
const arr4:[string,number,boolean] = ['',2,2,2]; // 这个是元组形式(这里测试boolean。和越界item类型)
// 可以理解数组，支持两种方式来描述类型
// 1、类型[] 或 Array<类型> ：用于标记是数组，且item类型为：指定的类型
// 2、元组形式：定义每个item的类型，越界item为联合类型

// object类型
const obj:object = {x:1};
obj.toFixed(); 
// 如果只是标记为object。则和上面基本类型一样。只能使用该类型上的方法


// void
let unusable: void = undefined;
unusable = null;
unusable = 2;   // 只能赋值null或undefined 




export {}