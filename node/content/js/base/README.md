# 零碎知识汇总

## 1、阻止input输入
```js
// 1、 <input value="2" onfocus="this.blur();"/>
// 效果，没有焦点，自然没法输入，体验：还不错。弊端：文字都不能选择了。也就是有副作用

// 2、 <input value="2" oninput="onInput()"/>
function onInput(){
    // 整体思路：
    // 走input时，给target.value === 绑定的value值（也就是defaultValue）
    // 只能其它方式给target.value赋值（也就是受控）
    const e = window.event;
    e.target.value=  e.target.defaultValue
    // 以下是测试代码
    // 同时：也发现，target上我们可以持久化保存一些其它信息
    // console.dir(e.target)
    // if(Math.random() > 0.5) {
    //     console.log('阻止')
    //     e.target.value=  e.target.defaultValue
    // } else {
    //     // 保存值
    //     e.target.hhh ='hcl'
    //     e.target.defaultValue = e.target.value
    // }
}
// 效果：有焦点，但不能输入。react采用的就是这种

// 3、readOnly
// 效果：类似于第一种，但没有副作用

// 4、disabled
// 效果：相对于readOnly。这里还有样式提示（暗底）（如果觉得丑，则用3）

// 综上：推荐2、3、4
```