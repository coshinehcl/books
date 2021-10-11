# 命令command

## 一、概念
```js
// 不同于选项，选项是可以输入多次，且是没有层级的概念的
// 命令：是有层级概念的，如：
//        吃
//    ↙︎       ➘
//   大口吃     小口吃


// 也就是有顶层命令，子命令等概念
```

```js
// 创建命令的方式
// 方式一：普通方式
program
  .command('clone <source> [destination]')
  .description('clone a repository into a newly created directory')
  .action((source, destination) => {
    console.log('clone command called');
});
// 由上面的概念可知，因为命令是由层级概念的，如果后面再接命令配置的话，就是上面这个命令的子命令
// 1、返回新生成的命令（即该子命令）以供继续配置

// 方式二、addCommand的方式
childCommand = new commander.Command()
    .command('jug')
    .action(() => {
      console.log('heat jug');
    });
program.addCommand(childCommand)
// 返回顶层命令，以供继续配置
```

```js
// 命令层级怎么创建（子命令和兄弟命令）

// 1、子命令
program
  .command('clone <source> [destination]')
  .description('clone a repository into a newly created directory')
  .action((source, destination) => {console.log('clone command called');})
  // 由上可知，这里获取到的是上面的子命令，这里紧接着配置就可以了
  .command('clone1 <source> [destination]')
  .description('clone1 a repository into a newly created directory')
  .action((source, destination) => {console.log('clone1 command called');})
// 效果    program -> clone -> clone1

// 2、兄弟命令
// 有上可知，子命令是紧接着配置即可，那兄弟节点呢？
// 当然是拿到父命令，从父命令那里注册一个命令就可以啦
// 这边以：     program -> child1Command 为例子
const child2_1Command = child1Command
  .command('clone <source> [destination]')
  .description('clone a repository into a newly created directory')
  .action((source, destination) => {console.log('clone command called');})

const child2_2Command = child1Command
  .command('clone1 <source> [destination]')
  .description('clone1 a repository into a newly created directory')
  .action((source, destination) => {console.log('clone command called');})
// 效果         program
//                |
//          child1Command
//             ↙︎       ↘︎
//  child2_1Command    child2_2Command
```