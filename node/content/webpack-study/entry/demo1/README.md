# 数组和对象的区别3

## 1、数组：multi-main entry（多个入口依靠关系绘制在一个chunk）

相当于把数组内的入口依赖导入一个入口
等同于
entry:{
    main:['./src/index.js','./src/index1.js']
}

我们也可以将一个文件路径数组传递给 entry 属性，这将创建一个所谓的 "multi-main entry"。在你想要一次注入多个依赖文件，并且将它们的依赖关系绘制在一个 "chunk" 中时，这种方式就很有用。

## 2、对象：灵活，多个chunk

## 3、对象数组：不支持
