# module

webpack操作的单元就是moduel，所以这个章节很重要

## 1、什么是moduel？

模块

## 2、如何去处理模块？

>> 匹配不同模块，做不同处理（条件）
>> 哪些信息可以作为条件来筛选？
>> 匹配到模块后，












每个规则可以分为三部分 - 条件(condition)，结果(result)和嵌套规则(nested rule)

## 1、条件

```txt
条件有两种输入值：

1、resource：资源文件的绝对路径。它已经根据 resolve 规则解析。
2、issuer: 请求者的文件绝对路径。是导入时的位置。

// 理解：这里是概念的描述
// 也就是资源的绝对路径和使用者的路径
```

## 2、

条件匹配： test / includes / exclude / noparse / resolver / issure / type
exclude > include > test

应用规则：use
loader
parse

// 查找resolve
嵌套规则：rules / oneof

loader种类：enforce（pre / post）、行内 loader
按照 前置(pre)、普通(normal)、行内(inline)、后置(post)
当前规则：所有loader，先执行Pitching 阶段(pitch)（由后到前）
再执行Normal 阶段方法，(由前到后)
如何禁用
！禁用普通
-！禁用普通和前置
!! 禁用所有


// 解析
parse

// 处理结果
generator


options:{}
细粒控制：parse / 

1、什么是module：模块
2、配置方式：配置/内联/cli
