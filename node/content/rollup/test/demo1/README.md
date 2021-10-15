# rollup运行测试

## 一、介绍

## 二、测试

```js
// one.js
import index from './index.js'
const add = (x,y)=>{
    return x+y;
}
const config = {
    version:'1.0.0'
}
const testSameName ='indexVar';
const testNoUse ='';
console.log(index,testSameName)
export default config;
export {add,testNoUse}

// index.js
import config,{ add } from './one';

const testSameName = 'indexVar'
console.log(config,add,testSameName)
export default [add,'testSISUO']

// 测试
// npx rollup src/index.js -o bundle.js -f es

// 输出
// bundle.js
const add = (x,y)=>{
    return x+y;
};
const config = {
    version:'1.0.0'
};
const testSameName$1 ='indexVar'; 
console.log(index,testSameName$1);

const testSameName = 'indexVar';
console.log(config,add,testSameName);
var index = [add,'testSISUO'];

export { index as default };


// 完美
// 思路：把引入的代码，拷贝进来;
// 1、处理好了同名；
// 2、Tree-shaking
// 3、处理好了引用死锁问题
```
## 三、总结