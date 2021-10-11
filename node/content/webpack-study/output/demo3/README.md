# 这里是主chunk相关的配置

## 1、filename 可以配置字符串（可以放到entry中配置）

## 2、library相关（可以放到entry中配置）

### 2.1、output.library.name

```js
library:'hcl'
=> hcl = (第一个主chunk的export,...第n个主chunk的export)
// 也就是如果entry是数组，则是对后一个chunk的导出
```

```js
library:['hcl','hcl1']
=> hcl = 第一个主chunk的export
=> hcl1 = 第二个主chunk的export
```

```js
// 标准写法
library:{
    name:'hcl',
    // ...
}
```

### 2.2、output.library.type

配置将库暴露的方式
'var'、'module'、'assign'、'assign-properties'、'this'、'window'、'self'、'global'、'commonjs'、'commonjs2'、'commonjs-module'、'amd'、'amd-require'、'umd'、'umd2'、'jsonp' 以及 'system'

>> var: 赋值给该变量（如果window上面有这个变量，则会覆盖）
>> assign：和var类型，只是没有显式声明该var hcl变量

>> this:赋值给this.hcl 给node环境使用
>> window：赋值给window.hcl 给window环境使用
>> global:赋值给global.hcl,global值取决于globalObject:this/self/window
>> commonjs:赋值给exports.hcl,给commonjs环境使用
>> module:赋值给export，给esmodule环境使用
>> 及其它模块环境commonjs2'，cmd,umd等

## 3、export

控制导出是主模块的哪个变量，支持子变量

```js
配置
library:{
    export:"default",
    type:'window',
    name:'hcl'
}

=>window.hcl = __webpack_exports__.default;
```

```js
配置
library:{
    export:["x","y"],
    type:'window',
    name:'hcl'
}

=>window.hcl = __webpack_exports__.x.y;
```
