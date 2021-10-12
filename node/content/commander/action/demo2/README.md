# 异步action

## 一、概念
处理函数支持async，相应的，需要使用.parseAsync代替.parse。

## 二、测试
```js
// 测试代码
const { program} = require('commander');

async function main() {
  program
    .command('run')
    .action(async function(){
        console.log('进入action',new Date().getSeconds())
        await new Promise((resolve)=>{
            setTimeout(() => {
                console.log('执行完action',new Date().getSeconds())
                resolve()
            }, 2000);
        })
        console.log('action end')
    });
  console.log('开始解析',new Date().getSeconds())
  await program.parseAsync();
  console.log('解析end',new Date().getSeconds())
}
main()
```
```js
// 测试
// 输入 node src/index run 
// 输出
开始解析 55
进入action 55
执行完action 57
action end
解析end 57
```