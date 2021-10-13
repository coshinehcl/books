# 使用指南
本项目是用于记录学习笔记和对一些文件的统一管理，是个好用的笔记本
优点：
1、src源码和README.md相结合，既方便调试，又方便书写文档
2、也可作为相关文件的统一存放位置
3、可配置，动态，好用

## 一、前端项目，在src下
前端负责菜单展示和内容展示
和主题（style）
和根据内容，生成内容的目录
```js
// 所以
// 书写README.md需要规范，明确h1-h5.
// 其中h1是作为文档的desc。也会作用于菜单
// 建议书写规范为：

// # 文档描述
// ## 一、xxx
// ### 1、xxx
// ## 二、xxx
```

## 二、node项目，在node下
node负责菜单和内容的获取，及记录。

## 三、笔记，放在node/content文件下
支持一级目录，二级目录，和三级目录
使用案例和md结合的方式，所以统一为以下格式
```js
//                   webpack
//                ↙︎     ↓     ↘︎
//            entry    mode    module   // 也就是某个章节的介绍
//         ↙︎    ↓    ↘︎ 
//     demo1  demo2  demo3              // 某个章节可能有多个知识点，用多个demo的形式来介绍
//    ↙︎   ↘︎
//  src   README.md                     // src负责代码执行，README.md负责文档介绍
// 在前端页面的打开按钮，点击后，code会直接打开一个新窗口并展示该路径下的代码。方便调试src或修改README.mds
```

```js
// node工作原理

// 1、node根据content文件夹下README.md来生成菜单
//    根据README.md到content的距离，可能会生成不同层级的菜单。
//    如：content下的webpack/entry/demo1/README,md，则会生成webpack/entry/demo1（三级菜单）
//    如：content下的js/base/README,md，则会生成：js/base（二级菜单）
//    如：content下的iview/README,md，则会生成 iview（一级菜单）

// 2、为了与api对应，文件路径都采用英文，中文名推荐在README.md的第一行# xxx 来介绍
//   每次读取该内容时，会拿到该数据，持久化在sql文件中
//   会一并返回到菜单中，以tooltip的形式展示

// 3、node读取到内容后，会对内容格式化
//   如图片，![avatar](1.png) 会转换为 ![avatar](http://localhost:3333/img/1.png)
//   路由判断是图片路径，则会去读取到该图片，并返回
//   如 内容尾部，会加上访问信息。

// 4、node还负责记录访问数据
//   如：dayRead.json中记录一级菜单，每天的访问信息，用于记录自己每天的阅读。
//   如：readDetail.json中记录每个菜单item的访问量，及菜单item对应内容的一些信息。
//   如：readStar.json中记录一级菜单总的访问量，（用于根据一级菜单访问量，动态调整一级菜单的顺序）

// 5、node会动态调整菜单顺序
//    一级菜单，通过readStar.json来排序，readStar记录一级菜单的访问量，访问越多的，则排序靠前
//    二级菜单，目前是通过静态配置来排序的，twoLevelRate.json。
//            home默认会添加在最前面,end(放综合demo或结束语)会放在最后面
//            对于排序不正确的，可以手动修改这里的配置，保证阅读顺序
```

## 四、提供了一个创建目录的脚手架

```js
// 1、提供content下的父目录名和若干个子目录名，即可创建符合结构的目录
// 2、并且，在一级目录下自动创建home，作为导读；创建end。作为结束
// 3、并且，自动创建统一格式的README.md内容
// 4、并且，该命令，还支持选项，如指定demo的数量，如是否自动code打开

// 具体效果，看node/content/commander/end/demo2
```