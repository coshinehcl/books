一、三种基础数据结构
栈、堆、队列

二、内存空间
1、代码运行 进入 执行上下文(可以理解为函数调用栈)
2、函数调用栈 开辟内存 变量对象 和 逻辑
3、函数调用栈中的 变量对象(引用类型) 指向 堆中的一个内存地址
4、可以理解为变量都是存在于堆中，如果是基础类型，直接存于本结构中，如果是引用类型，则存的是指向另一个堆内存的地址
   因为引用类型结构复杂，抽离出来整体结构会更清晰及方便共享(地址共用)
5、数据类型：Undefined、Null、String、Boolean、Number、Symbol、引用
6、Undefined可以理解为基本数据类型没有值
7、Null可以理解为引用类型没有值(引用地址没有值)

三、内容空间的管理
1、算法： 引用计数、标记清除
2、不需要使用的变量，置为null

四、执行上下文(函数调用栈)  ECStack(execution content stack)
1、栈结构：先进后出，后进先出
2、生命周期
    2.1、创建阶段(解析阶段)
    2.2、执行阶段
    2.3、出栈、等待回收
3、创建阶段：(站再对象角度能更好的理解)
    3.1、生成变量对象 VO (variable Object)：自身有哪些属性
    3.2、确定作用域链：scopeChain 类比 对象的 _proto_ 查找上一级的属性
    3.3、确定this指向：这个是函数才有的，对象没有。
4、生成变量对象 VO 对应调试的 scope 
    4.1、类型：global local block
    4.2、收集和提升：收集函数调用栈内所有的函数/变量 声明，并且前置（提升）
    4.3、先收集函数（优先级比变量是不是更重要），因为函数有值，所以同名覆盖；
    4.4、对象声明是undefined，及避免影响同名函数，所以同名跳过
    4.5、大概结构为 
    {
        fun1:<fun1 reference>,
        fun2:<fun2 reference>,
        a:undefined,
        b:undefined
    }
5、执行阶段
    5.1、对 变量对象VO 执行 读取操作（赋值，取值）：此时 VO 处于活动状态，也称作为 AO (activation Object) 
    5.2、创建阶段VO只是收集和提升，变量值为undefined，只有执行阶段赋值之后才有值
    5.3、例子
    function f1(){console.log('1')}
    var a = 1
    function f1(){console.log('2')}
    f1()
    var f1 = 3
    console.log(f1)
    f1 = 4
    console.log(f1)
    // 创建阶段，创建AO
    // 提升f1
    AO = {
        f1: function(){console.log('1')},
    }
    // 提升f1(是同名函数，直接覆盖)
    AO = {
        f1: function(){console.log('2')},
    }
    // 已经没有函数声明了，再提升变量，提升 a变量
    AO = {
        f1: function(){console.log('2')},
        a：undefined
    }
    // 提升f1变量，和前面同名，跳过
    //此时，已经完成AO的创建
    // 执行阶段
    // 执行 f1()：此时输出 AO中的f1,执行后输出2
    // 执行 f1 = 3：此时 AO中的f1赋值为，3
    // 执行  console.log(f1) ： 此时 输出 AO中的f1为 3
    // 执行 f1 = 4：此时 AO中的f1赋值为，4
    // 执行  console.log(f1) ： 此时 输出 AO中的f1为 4
6、闭包概念：(确定作用域链)
    6.1、上面有分析，执行上下文会创建VO:这是内部变量的访问机制
    6.2、那外部变量的访问机制是什么呢？ 其实就是作用域链：scopeChain 类比 对象的 _proto_ 查找上一级的属性
    6.3、相比于对象的_proto_,函数的要复杂一些
    6.4、对象的_proto_，保存在函数(构造函数)的prototype中
    6.5、函数的作用域链，保存在函数的scopeChain中，存放的是父函数栈的部分ES
    father ES:{
        a:father VO.a
        _proto_:grandfather VO.b
    }
    6.6、scopeChain生成时机：父调用栈销毁时，或本函数入栈如果没有scopeChain则生成(如果有了，则不在生成，避免访问运行时的作用域)
    6.7、由6.6可知，作用域链是定义时确定，永远不会改变（符合思维逻辑）
    6.8、由以上概念，得到闭包概念：即函数执行，访问了外部（非global）中的变量，就会产生闭包， => 调试中的 Closure
    6.9、简单理解为：
    执行函数调用栈：如果没有scopeChain,则从父调用栈那里获得scopeChain
    销毁函数调用栈：对内部函数自动赋值scopeChain
    确保每个函数都有作用域链,如果没有该函数没有访问到父函数中的VO变量，也会生成作用域链
    scopeChain 可以简单理解为对象的_proto_:多个子函数闭包访问的都是父 scopeChain（同一个引用地址）
7、梳理下函数内访问机制：（站在对象角度）
    7.1、内部变量访问机制：收集及提升内部函数/变量
    7.2、上级及../变量访问机制：作用域链：类比对象的_proto_ ：对应 调试中的 Closure（函数内部的函数都有！！，确保可以正确访问上级或../变量）
    7.3、全局变量访问机制：global
    7.3、以上所有变量的访问：对应 调试 中的 scope
8、加强理解(例子)
function f1() {
    for(var i = 0;i< 10; i++) {
        setTimeout(function() {
            console.log(i)
        },1000)
    }
}
f1()
//先执行f1()
//f1中，执行for 遇到宏任务，派发，执行其它代码，此时 i === 10
//执行完了，函数栈出栈，给function() {console.log(i)} 赋值 scopeChain 此时 i === 10
//然后执行微任务，没有，执行宏任务 如有 则执行function() {console.log(i)}
// 执行 console.log(i) 输出：i 为10
9、闭包作用：
9.1、外部套一个自执行函数，相当于增加作用域链，快照此时的上级scope值
    如 setTimeout((i)=>{}),0) => ((i){ setTimeout((i)=>{}),0) })(i)
9.2、作用域链只有该函数可以访问。 私有！！！ 可以产生 私有空间  模块化雏形

五、this
1、函数执行时，VO -> AO 确定this指向
2、作用：前面有介绍函数执行时 的 变量对象(访问内部) 及 作用域链（访问外部）
   但如果函数是某个对象的属性，函数内要访问该对象的其它属性，怎么操作。
   于是出现this
3、this指向：执行时，指向调用该函数的对象。
   如o.fun(),则指向o，如果不是对象来调用的，fun()严格模式为undefined,非严格模式为window
   //事件函数，其实是该DOM调用的，所以 this === e.currentTarget
4、改变函数的this指向：call、apply、bind：即让该对象来调用就行了
    4.1、模拟call：支持多参
    Function.prototype.call1 = function (ctx,...args) {
        // 对ctx装包
        ctx = ctx && new Object(ctx) || window
        const proto = Symbol()
        ctx[proto] = this
        const result = ctx[proto](...args)
        delete ctx[proto]
        return result
    }
    4.2、模拟apply：只支持传一个形参
    Function.prototype.apply1 = function (ctx,args) {
        // 对ctx装包
        ctx = ctx && new Object(ctx) || window
        const proto = Symbol()
        ctx[proto] = this
        const result = ctx[proto](args)
        delete ctx[proto]
        return result
    }
    4.3、模拟bind :不会立马执行，只是指定了this(后续改不了)及部分参数
    Function.prototype.bind1 = function (ctx,...args) {
        // 对ctx装包
        ctx = ctx && new Object(ctx) || window
        const proto = Symbol()
        ctx[proto] = this
        // 既然绑定的this是后续改不了的。也就是这里返回的是一个函数，内部固定这个对象调用
        return function(...newArgs) {
            const result = ctx[proto](...args,...newArgs)
            delete ctx[proto]
            return result
        }
    }
    4.4 call/apply/bind 应用
    4.4.1 改变this
    4.4.2 this调用其它数据结构的通用方法
          数组增删改查都可以用于类数组 
          //增删
          push/pop :  [].push.call({}, 1,2,3) => {0: 1, 1: 2, 2: 3, length: 3}
          unshift/shift :  [].unshift.call({0: 1, 1: 2, 2: 3, length: 3},10) => {0: 10, 1: 1, 2: 2, 3: 3, length: 4}
          splice :  [].splice.call({0: 1, 1: 2, 2: 3, length: 3},0,1,10,11) => {0: 10, 1: 11, 2: 2, 3: 3, length: 4}
          //改
          copyWithin ：[].copyWithin.call({0: 1, 1: 2, 2: 3, length: 3},0,2,3) => {0: 3, 1: 2, 2: 3, length: 3}
          fill : [].fill.call({ length: 3 }, 4) => {0: 4, 1: 4, 2: 4, length: 3}
          //查(迭代)：forEach/some/every/filter/map/find 及findIndex/find/includes
          // 注意此时，如果有返回，则是数组
          filter:  [].splice.call({0: 1, 1: 2, 2: 3, length: 3},v => v >1) => [2,3]
          //生成新数组的：map/filter/slice/concat 此时返回新数组
          //如果什么都没做，相当于执行了 类数组=>数组
          map :  [].map.call({0: 1, 1: 2, 2: 3, length: 3},v => v) => [1,2,3]
          filter : [].filter.call({0: 1, 1: 2, 2: 3, length: 3},v => true) => [1,2,3]
          slice ： [].slice.call({0: 1, 1: 2, 2: 3, length: 3}) => [1,2,3]    
    4.4.3 apply 还有一个隐式转化： 实参：[1，2，3] => 形参：(x,y,z) 可以用于数组/类数组参数的函数
        如：Math.max(value1[,value2, ...]) 可以 Math.max.apply(null, [value,value2,value3])
            Math.min([value1[, value2[, ...]]]) 可以 Math.min.apply(null, [value,value2,value3])
            arr1.push(1,2,3) 可以 Array.prototype.push.apply(arr1, [1,2,3])
            [].push.apply(null, {0: 1, 1: 2, 2: 3, length: 3})
    5、call/apply/bind 应用
        5.1、设置this指向
        5.2、执行通用方法，有的还有伪数组=>数组 功能
        5.3、apply 还有 ...args作用

六、new 和 create 和 继承
1、模拟new: 简单理解可以为：左边对象作为右边函数的this执行了代码。且继承了原型
  new Foo(...args) =>
  function(..args){
    const obj = {}
    obj._proto_ = Foo.prototype
    Foo.call(obj,...args)
    //此时this有了Foo的内部属性 及 原型方法
    return obj
  }
2、继承 这边假设Fathar => child
 2.1、对象冒充：优点：较方便实现继承及多继承  缺点：没有继承原型及容易同名覆盖
    function Child(...selfArgs,...args1,...args2) {
        // 获得Father中的函数变量
        Father1.call(this,...args1)
        Father2.call(this,...args2)
        //添加自己的变量
        this.xx = 1
    } 
    let child = new Child(selfArgs,args1,args2)
2.2、原型链继承：优点：实现了原型链继承 缺点：不能多继承
    function Child(...selfArgs) {
        //添加自己的变量
        this.xx = 1
    }
    // 重点
    Child.prototype = new Father() // 此时  Child.prototype = Father.prototype
    let child = new Child(selfArgs) // 此时 child._proto_ = Child.prototype 
    // 此时，如果Child.prototype没找到，就会在Child._proto中找，即 继承了Father的原型方法
2.3、混合方式：优点：实现了构造函数 和 原型的继承问题 缺点：语义不是很明确
    function Child(...selfArgs,...args1,...args2) {
        // 获得Father中的函数变量
        Father1.call(this,...args1)
        Father2.call(this,...args2)
        //添加自己的变量
        this.xx = 1
    } 
    // 重点
    Child.prototype = new Father() // 此时  Child.prototype = Father.prototype
    let child = new Child(selfArgs) // 此时 child._proto_ = Child.prototype = Father.prototype
3、Object.create  语法：Object.create(prototype,{x:{value: 1,writable: true}})
   Object.create = function(prototype, propertyObj) {
       propertyObj = propertyObj || {}
       propertyObj._proto_ = prototype
       return propertyObj
   }
4、创建对象： new create 字面量 区别
    4.1、{} 简单
    4.2、new 通过构造函数 创建 继承属性和原型了的变量 侧重继承
    4.3、Object.defineProperties(obj,{property:{}}) 侧重属性描述符形式 添加属性
    4.3、Object.create() 侧重指定原型对象 及 属性描述符形式 添加属性
5、class 继承逻辑
class Child extends Father {
    constructor(ChildArgs,FatherArgs) {
        super(FatherArgs)
        this.childProperty = ChildArgs
    }
    childPrototypeFun(){}
    static function staticFunc(){}
}
const child = new Child('child','father')
//等同于es5的
==> 对比混合模式，这里class相当于语法糖
// 
var Child = (function(Father){
    function Child(ChildArgs,FatherArgs) {
        // 构造函数继承
        Father.call(this,FatherArgs)
        this.childProperty = ChildArgs
    }
    // 原型继承
    Child._proto_ = new Father() // 此时  Child._proto_ = Father.prototype
    // 自身 prototype
    Child.prototype.childPrototypeFun = function(){}
    // 静态方法
    Child.staticFunc = function({})
    return Child
})(Father)
var child = new Child('child','father')
6、访问链总结：
    6.1、通过_proto_ 指向构造函数的prototype : 除了原型属性外，还有constructor保存构造函数的引用地址
    6.2、构造函数的prototype 变量中也没有，则继续访问其的_proto_

七、Object.defineProperties 和 Proxy
1、Object.defineProperties ： 该方法允许精确地添加或修改对象的属性
    // 影响了 删除、改查、配置 的操作。
    1.1、语法：Object.defineProperty(obj, prop, descriptor)
    1.2、descriptor描述符有：configurable、enumerable、数据描述符:[writable、value]、存取描述符[get、set]
    1.3、configurable： 默认false; 是否可配置。如果不可配置。则该属性不能被删除、且描述符不能再配置。
         说明：对于writable:可以由true -> false。
               对于value:writable 优先级比configurable高
        enumerable：是否可枚举（for-in自身及原型 和 hasOwnProperty、keys、values、entries）
                    但getOwnPropertyNames可以遍历出所有非symbol属性，包括不可枚举

七、函数和函数式编程
1、函数：函数声明、函数表达式、匿名函数、自执行函数
2、函数式编程：函数是一等公民、纯函数、高阶函数、柯里化、代码组合
    2.1、函数是一等公民：函数可以放在任何变量的地方
    2.2、纯函数：相同参数 总是得到相同 结果： 可靠（复用，可缓存性）

八、从继承角度理解 内置对象(构造函数对象)
// 技巧：console.log({Object}) 可以查看其结构
1、Null 一切都是对象
2、基本结构：null、undefined、boolean、string、number、symbol
3、引用类型：object、function(函数对象)
4、把以上当作不同的存储方式(想象成不同的结构)：这也是为什么typeof 可以区分它们的原因
5、那有了这些基本结构，怎么建立一个大厦呢? 从object和function 入手
6、继承概念：__proto__(自身没有，从这里查找，向上查找) 和 prototype(定义需要继承的对象：原型对象)

// 开始搭建大厦( 内置函数对象 都是 原型派生)
// 为了描述方便，属性/函数属性/所有属性 来描述
6、创建一个最基本的对象： Base对象
7、创建一个最基本的函数对象：base函数
    继承基本对象的方法
    base函数.__proto__ = Base对象
    然后添加它自己的属性，如：name/arguments/length
    然后添加就它自己的函数属性，如：call/apply/bind 等方法，然后这些方法 __proto__ = base函数
    // 这些函数因为也继承了  base函数，所以也拥有了 base函数 的所有属性
    至此：这个 base函数 拥有了自己的所有属性，及 Base对象 的所有属性
8、然后再Base对象上 添加属性(添加的是函数对象)
    hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toString,valueOf

// 由 6、7、8 至此：基本的Object和function类型已经搭好了
// 开始派生

9、Object 函数对象
   Object.__proto__ = base函数 // 拥有 base函数 所有属性；间接拥有 base对象 所有属性
   再添加自己的函数属性，如：create/keys/values/entries/is/...
   为了方便访问到及创建其它对象能继承到 Base对象,于是 Object.prototype = Base对象
   Object 派生出一个最基本的子类：{}
10、Function 函数对象
    Function._proto__ =  base函数 // 拥有 base函数 所有属性；间接拥有 base对象 所有属性
    // Function 没有添加额外的函数
    为了方便访问到 base函数，于是 Function.prototype = base函数
11、Function 函数对象 并不是很好用
    于是 function(){} 可以直接从 base函数 派生

12、为了更加清晰看清，这边再拿 Number 来举例
    Number.__proto__ = base函数
    然后再添加自己的函数属性，如 parseInt/parseFloat/isFinite/isInteger/isNaN 等
    又提供了 继承用的对象 property{ toFixed/toPrecision/toString/toValue }
    let a = new Number(1) =>  Number {1}
    __proto__: Number
    constructor: ƒ Number()
    toExponential: ƒ toExponential()
    toFixed: ƒ toFixed()
    toLocaleString: ƒ toLocaleString()
    toPrecision: ƒ toPrecision()
    toString: ƒ toString()
    valueOf: ƒ valueOf()
    __proto__: Object
    [[PrimitiveValue]]: 0
    [[PrimitiveValue]]: 1
    // let b = Number(1) => b === 1
    // 说明，我们写的字面量 调用函数时，内部会自动装包（toObject） => 对应类型的对象 如  Number {1}
    // 当然，如果我们需要某个类型的字面量: Symbol.toPrimitive 是一个内置的 Symbol 值，它是作为对象的函数值属性存在
    //的，当一个对象转换为对应的原始值时，会调用此函数
13、由上面分析
    应该对 基本类型，typeof原理、__proto__、prototype
    js继承大厦的搭建、(对象，字面量，装包/解包)
    有一定深度的了解了。

九、深入了解 内置构造对象的 所有方法
1、Object
1.1、原型方法：提供对象最基本的功能
    1.1.1、自身属性(是否存在，是否可枚举)
            A:hasOwnProperty() 方法会返回一个布尔值，指示对象自身属性中是否具有指定的属性
              说明：遍历自身，包括不可枚举
              对比：Object.getOwnPropertyNames() 这个方法是返回该对象的所有属性，包括不可枚举
            B:propertyIsEnumerable() 方法返回一个布尔值，表示指定的属性是否可枚举,不包括原型上的
    1.1.2、判断原型
           A:isPrototypeOf() 判断当前对象  是否处于 是另外一个对原型链上(继承链)
             如：Object.prototype.isPrototypeOf({}) // true 因为{} 是 Object.prototype 派生出来的
             说明：可以用于 原型 检查
    1.1.3、解包相关：解包的时候，首先尝试使用valueOf()，再尝试使用toString()属性
           A:toString() 方法返回一个表示该对象的字符串 
             说明：默认是[object Object]、[object String]、[object Date]等
                  可以用于类型检查 Object.prototype.toString.call(1) => '[objcet Number]
           B：valueOf() 方法返回指定对象的原始值，很少手动调用，一般用于解包是系统调用
1.2、自身方法：提供了对象完整的功能(自身、属性、遍历、及其它功能)
    1.2.1、创建对象本身
            A:setPrototypeOf(obj, prototype) / getPrototypeOf(object) 设置/返回 原型对象
            B:create(pC:roto[, descriptors]) 创建 指定原型对象及自身属性 的对象
            C:fromEntries() 方法把键值对列表转换为一个对象
            D:assign(target, ...sources) 浅拷贝一个或多个对象 自身 且 可枚举 属性到target
    1.2.2、设置对象本身类型：防篡改（拓展、密封、冻结）
            A:preventExtensions / isExtensible:扩展特性: 阻止向对象添加新属性
            B:seal / isSealed:密封特性 密封 === 对象不可拓展+不可配置(configurable:false)
            C:freeze / isFrozen:冻结特性 冻结 === 密封+不可写(writable:false)
    1.2.3、定义属性：更精准的定义/修改 属性/s
            A:defineProperty(obj,property,descriptor) / defineProperties(obj,descriptors) 
    1.2.4、遍历属性相关：都是遍历自身
            A:遍历自身且可枚举属性：keys、values、entries、assign：
            B:遍历自身所有属性：getOwnPropertyNames() / getOwnPropertySymbols() / getOwnPropertyDescriptor(obj, prop) / getOwnPropertyDescriptors()
            说明：for in ：遍历一个对象的除Symbol以外的可枚举属性，包括原型对象上的。
                 因为包括原型上的，实际项目不建议使用，避免不可知问题。
    1.2.5、其它：
            A:is() 方法判断两个值是否为同一个值:可以区分
              说明：Object.is(+0,-0) // false  Object.is(NaN,NaN) // true
2、String：UTF-16编码(0 到 65535) ： 字符串是不可改变的。
2.1、原型方法：提供创建及检索(查)的功能
    2.1.1、重写相关：
            A:toString() 方法返回指定对象的字符串形式
            B:valueOf() 等同于 toString()
    2.1.2、创建:因为字符串是不可改变的，所以没有增删改操作。都是在原字符串的操作返回新的字符串，不影响原字符串。
            A:slice(beginIndex[, endIndex]) 返回原字符串指定位置的新字符串
            B:repeat(count) 返回包含指定字符串的指定数量副本的新字符串
            C:concat(str2, [, ...strN])：强烈建议使用赋值操作符（+, +=）代替 concat 方法
            D:padStart()/padEnd()、trim()/trimStart()/trimEnd()、toLowerCase()/toUpperCase() 
    2.1.2、查相关
            A:index检索:charAt() 返回指定位置的字符、charCodeAt() 返回指定位置的字符的code码(0 到 65535)
            B:value检索:startsWith()/endsWith()、includes()、indexOf()/lastIndexOf()
            C:正则检索：match()/matchAll()、search()
2.2、自身属性
    2.2.1、length
2.3、自身方法：提供一些 不常用但很有用的方法
    2.3.1、raw() 解析模板字符串 会自动帮我们调用
    2.3.2、创建相关：
            A:fromCharCode(num1[, ...[, numN]]) 返回指定UTF-16编码(0 到 65535)的字符串
            B:fromCodePoint(num1[, ...[, numN]]) 返回指定的UTF-32(UTF-16编码超集)编码的字符串
3、Number Number类型为双精度IEEE 754 64位浮点类型 范围在-(253 - 1) 到 253 - 1
3.1、原型方法：重写属性 及 格式化功能
    3.1.1、重写相关：
            A:toString([radix]) 方法返回指定对象的字符串形式。radix：基数，2到36。
              说明：因为可能有字符出现，所以放在这里实现，而不是valueOf(),注意返回的是字符串：2.toString(10) !== 2
            B:valueOf()
    3.1.2、格式化，返回字符串
            A:toExponential(fractionDigits) 返回指定小数个数的 指数表示法
            A:toFixed(digits) 指定精度[0,20] 
            B:toPrecision(precision) 指定总宽度多少，如果给定宽度少于实际整数宽度，会以 指数表示法返回
3.2、自身属性：
    3.2.1、MAX_SAFE_INTEGER：最大安全整数 2^53 -1:9,007,199,254,740,991:9万兆
    3.2.2、MIN_SAFE_INTEGER：最小安全整数-9007199254740991：-9万兆
3.3、自身方法： 
    3.3.1、isSafeInteger(testValue) 返回是否是安全整数，布尔值
    3.3.2、parseFloat() 方法可以把一个字符串解析成浮点数，注意内部首先会先转化成字符串
    3.3.3、parseInt() 方法可以把一个字符串解析成浮点数，注意内部首先会先转化成字符串
4、Array
4.1、原型方法： 
    4.1.1：重写相关：
            A:toString() 方法返回指定对象的字符串形式。
              说明：如果是数组调用，等同于.join(',')；其它调用，等同于 Object.prototype.toString.call(obj)
            B:valueOf() 返回数组本身； arr.valueOf() === arr
    4.1.2:创建相关：不改变原数组
            A:slice([begin[, end]])
            B:old_array.concat(value1[, value2[, ...[, valueN]]])
            C:flat([depth]) 拍平 flatMap()
    4.1.3：增删相关：增加时返回新数组的长度，删时返回删除的item
            A:栈尾操作：push(element1, ..., elementN) / pop() 
            B:栈头操作：unshift(element1, ..., elementN) / shift() 反向操作：可以用于反转数组。
            C:增删：splice(start[, deleteCount[, item1[, item2[, ...]]]]) 返回删除item组成的数组
    4.1.4：改相关：不改变长度，返回改变后的数组。都是浅拷贝
            A:copyWithin(targetIndex[, start[, end]])
            B:fill(value[, start[, end]])
            C:reverse() 反转
            D:sort([compareFunction]) 排序，如果没有指定排序函数，默认是item转字符串，然后比较UTF-16 的code码 升序排序
    4.1.5、查相关：
            A:value检索:indexOf()/lastIndexOf()、includes()
            B:测试函数：find() / findIndex()
    4.1.5、遍历相关：
            A:forEach / map() / filter() / some() /  every()
            B:reduce() / reduceRight()
    4.1.6、迭代相关：
            A:keys()
            B:values() Array.prototype.values 是 Array.prototype[Symbol.iterator] 的默认实现
            C:entries()
    4.1.7、其它：
            A:转字符串：join([separator]) separator默认是","
4.2、自身属性
    4.2.length
4.3、自身方法：
    4.3.1、创建相关：
            A:from(arrayLike[, mapFn[, thisArg]]) 类数组转数组
            B:of(element0[, element1[, ...[, elementN]]]) 用于修复 new Array(4) => [empty × 4]
            说明： new Array(1,2,3) => [1,2,3]; new Array(5) => 如果只有一项，则会生成长度为该值的数组：[empty × 5]
    4.3.2、判断是否是数组：isArray(obj)
4.4 知识补充：稀疏数组
    4.4.1、会产生的情况：
        // 构造函数声明一个没有元素的数组
        var a = new Array(5);    // [empty × 5]
        // 指定的索引值大于数组长度
        var a = [];
        a[5] = 4;                // [empty × 5, 4]
        // 指定大于元素个数的数组长度
        var a = [];
        a.length = 5;            // [empty × 5]
        // 数组直接量中省略值
        var a = [0,,,,];         // [0, empty × 3]
        // 删除数组元素
        var a = [0, 1, 2, 3, 4];
        delete a[4];             // [0, 1, 2, 3, empty]
    4.4.2、转化为密集数组：'' => undefined; 如 Array.from(new Array(2)) => [undefined, undefined]
        A: Array.apply(null,targetArr)
        B：Array.from(targetArr)
        c：[...targetArr]
    4.4.3、稀疏数组注意事项：
        A: 该稀疏项，其实不属于数组的属性：(new Array(2)).hasOwnProperty(0) => false
        B：es5那些迭代会 if(k in Object(this)){} 来过滤掉非自身属性
        C: forEach 实现核心代码：
        while (k < len) {
            var kValue;
            if (k in O) { // in 会从自身及原型查看是否有这个属性
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
5、Math:与其他全局对象不同的是，Math 不是一个构造器
// 即Math 是直接从Object.prototype 继承下来的
// 对应的也就没有必要prototype属性存在
5.1、自身属性：
    5.1.1：提供一些数学常量/公式：E、PI、LN2/LN10
5.2、自身方法：
    5.2.1：正弦/余弦/正切/余切：sin/asin / cos/acos / tan/atan 
    5.2.2:常用方法： abs() / ceil / floor / min / max / round / random
6、