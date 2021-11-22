# home

```js
// 本文顺序

// 1、Vue构造器
// 2、Vue实例
```

```html
<!-- 这边从原始的方法开始来测试 -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div id="app">{{color}}</div>
</body>
<script type="module">
    import Vue from './vue.esm.browser.js';
    const vm = new Vue({
        name:'hcl',
        data(){
            return {
                color:'red'
            }
        }
    })
    vm.$mount('#app')
</script>
</html>

<!-- 开启http服务，来看效果 -->
<!-- 具体过程按下面步骤来 -->
```

```js
// 我们使用vue.esm.browser.js 版本
// 我们来看下是怎么构造出来的

// 源码中

// npm run build
// 执行 "build": "node scripts/build.js"
// "我们发现其会构造很多不同环境的代码"
// "我们找到我们需要的"
'web-full-esm-browser-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.esm.browser.js'),
    format: 'es',
    transpile: false,
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
},
// 找entry:src/platforms/web/entry-runtime-with-compiler.js(完成web解析版本的差异)
import Vue from './runtime/index'
Vue.prototype.$mount = function(el,hydrating){/*略*/}
Vue.compile = compileToFunctions // 增加模板解析的方法
// 我们进入"./runtime/index"(完成web的差异)
import Vue from 'core/index'
// install platform specific utils
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
// 略
// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)
Vue.prototype.__patch__ = inBrowser ? patch : noop
Vue.prototype.$mount = function(el,hydrating){/*略*/}

// 整理：
// 1、核心代码
import Vue from 'core/index'
// 2、web差异
import Vue from './runtime/index'
// 3、web编译差异
src/platforms/web/entry-runtime-with-compiler.js

// 总结：
// Vue在core/index版本的基础上，区分平台，区分是否runtime来构建了不同的版本
// 下面我们从'core/index'来分析Vue构造器是怎么完成的
```
## 一、介绍Vue构造器
```js
// 上面我们知道了Vue构建不同版本是怎么做的
// 也就是在共同Vue构造器基础上，做平台和runtime差异补丁

// 这里我们直接来看Vue构造器是怎么完成的
// 我们来想下，我们要构造一个Vue构造器，会怎么做呢？

// 1、Vue上提供静态属性和方法
// 2、Vue原型上面提供属性和方法

// 真实情况也是如此
```

### 1、共同构造器入口
```js
// 入口：src/core/index.js
// 为了描述方便，下面以构造器来描述，而不是共同构造器（这里这么描述只是为了方便理解上段的操作）
// 这里其实主要就是完成Vue自身方法，也就是静态方法的注册
import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

initGlobalAPI(Vue)

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

Vue.version = '__VERSION__'

export default Vue

// 这里我们主要关注initGlobalAPI
// 1、initGlobalAPI，生成Vue静态方法。内容有
//    全局配置：silent、devtools、errorHandler、warnHandler等
//    全局APi：extend、nextTick、delete、set等

// 具体看代码或
https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80%E9%85%8D%E7%BD%AE
```

### 2、构造器原型方法注册
```js
// 从上段import Vue from './instance/index'
// 我们来看下这段代码的内容
// 其实也就是完成Vue原型的注册
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue

// 这里就是Vue的原型构建了。我们逐个来看


// 1、initMixin
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {/*略*/ }
}
// 原型挂载：init方法
// _init方法

// 2、stateMixin
export function stateMixin (Vue: Class<Component>) {
    Object.defineProperty(Vue.prototype, '$data', {get(){return this._data},set(){warn('readOnly')}})
    Object.defineProperty(Vue.prototype, '$props',{get(){return this._props},set(){warn('readOnly')}})

    Vue.prototype.$set = set
    Vue.prototype.$delete = del
    Vue.prototype.$watch = (expOrFn,cb,options){/*略*/}
}
// 原型挂载：数据相关的
// $data、$props、$set、$delete、$watch

// 3、eventsMixin
export function eventsMixin (Vue: Class<Component>) {
    Vue.prototype.$on = function(event,fn){/*略*/}
    Vue.prototype.$once = function(event,fn){/*略*/}
    Vue.prototype.$off = function(event,fn){/*略*/}
    Vue.prototype.$emit = function(event){/*略*/}
}
// 原型挂载：事件相关的
// $on、$once、$off、$emit

// 4、lifecycleMixin
export function lifecycleMixin (Vue: Class<Component>) {
    Vue.prototype._update = function (vnode, hydrating) {/*略*/}
    Vue.prototype.$forceUpdate = function () {/*略*/}
    Vue.prototype.$destroy = function (/*略*/) {
}
// 原型挂载：生命周期相关的
// _update、$forceUpdate、$destroy

// 5、renderMixin
export function renderMixin (Vue: Class<Component>) {
    // 原型上面挂载渲染的一些方法,方法名都是_x。如_o，_n，_s，_l
    installRenderHelpers(Vue.prototype)
    Vue.prototype.$nextTick = function (fn: Function) {return nextTick(fn, this)}}
    Vue.prototype._render = = function (): VNode {/*略*/}
}
// 原型挂载：渲染相关的
// _o，_n，_s，_l等渲染help方法，$nextTick，_render

// 总结：也就是原型上面挂载各种方法
// init
// 数据
// 事件
// 生命周期
// 渲染

// 从这里看像不像Vue的文档目录
```

### 3、我们来看下Vue对象结构
```js
// 我们来看下Vue对象结构

// console.dir(Vue);
{
    // GlobalApi生成的
    config: (...)
    get config: () => config
    set config: () => {…}
    util: {warn: ƒ, extend: ƒ, mergeOptions: ƒ, defineReactive: ƒ}
    set: ƒ (target, key, val)
    delete: ƒ del(target, key)
    nextTick: ƒ nextTick(cb, ctx)
    observable: (obj) => { observe(obj); return obj }
    options: {components: {…}, directives: {…}, filters: {…}, _base: ƒ}
    use: ƒ (plugin) // initUse(Vue)
    mixin: ƒ (mixin) // initMixin(Vue)
    cid: 0          //  initExtend(Vue)，也就是extend后，cid会++，不同构造器cid不一样
    extend: ƒ (extendOptions) //  initExtend(Vue)
    component: ƒ ( id, definition )   // initAssetRegisters(Vue)
    directive: ƒ ( id, definition )   // initAssetRegisters(Vue)
    filter: ƒ ( id, definition )      // initAssetRegisters(Vue)
   
   // 编译版生成的，当然编译版还覆盖了其它的差异。
   // 这里描述下，web编译版本，还增加了$mount方法,__patch方法，修改了options和config等
    compile: ƒ compileToFunctions( template, options, vm )

   // 入口生成
    version: "2.6.14"
    FunctionalRenderContext: ƒ FunctionalRenderContext( data, props, children, parent, Ctor )
    prototype: {_init: ƒ, $set: ƒ, $delete: ƒ, $watch: ƒ, $on: ƒ, …} // 部分原型，下面分析
    
    [[FunctionLocation]]: vue.esm.browser.js:5122
    [[Prototype]]: ƒ ()
    [[Scopes]]: Scopes[2]
}

```
```js
// Vue原型对象
{   
    // _init方法
    _init: ƒ (options)

    // stateMixin
    $data: (...)
    get $data: ƒ ()
    set $data: ƒ ()
    $props: (...)
    get $props: ƒ ()
    set $props: ƒ ()
    $set: ƒ (target, key, val)
    $delete: ƒ del(target, key)
    $watch: ƒ ( expOrFn, cb, options )

    // eventsMixin
    $on: ƒ (event, fn)
    $once: ƒ (event, fn)
    $off: ƒ (event, fn)
    $emit: ƒ (event)

    // lifecycleMixin
    _update: ƒ (vnode, hydrating)
    $forceUpdate: ƒ ()
    $destroy: ƒ ()
  
    /**
     * renderMixin
     * 除了$nextTick和_render
     * 其它是installRenderHelpers提供，用于渲染帮助函数
     **/
    $nextTick: ƒ (fn)
    _render: ƒ ()
    _b: ƒ bindObjectProps( data, tag, value, asProp, isSync )
    _d: ƒ bindDynamicKeys(baseObj, values)
    _e: (text = '') => {…}
    _f: ƒ resolveFilter(id)
    _g: ƒ bindObjectListeners(data, value)
    _i: ƒ looseIndexOf(arr, val)
    _k: ƒ checkKeyCodes( eventKeyCode, key, builtInKeyCode, eventKeyName, builtInKeyName )
    _l: ƒ renderList( val, render )
    _m: ƒ renderStatic( index, isInFor )
    _n: ƒ toNumber(val)
    _o: ƒ markOnce( tree, index, key )
    _p: ƒ prependModifier(value, symbol)
    _q: ƒ looseEqual(a, b)
    _s: ƒ toString(val)
    _t: ƒ renderSlot( name, fallbackRender, props, bindObject )
    _u: ƒ resolveScopedSlots( fns)
    _v: ƒ createTextVNode(val)

    // core/index提供
    $isServer: (...)
    $ssrContext: (...)

    // web编译版本
    $mount: ƒ ( el, hydrating )
    __patch__: ƒ patch(oldVnode, vnode, hydrating, removeOnly)
}
```
## 二、 看new Vue()实例化做了什么

```js
// 我们先来思考下，new Vue()需要做什么

// 前面我们有分析Vue的构造器，注册了大量的静态方法和原型方法/属性

// 1、初始化一系列的状态来存储自己状态及相关上下文
// 2、处理options
// 3、走mount

// 结果也是如此
```
```js
// 源码
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

// 再看_init
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // 优化内部组件实例化
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```
### 1、初始化一系列状态及上下文
```js
// 初始化一系列状态及上下文
// 1、vm._uid = uid++; // 前面我们有看到构造器的cid也会自增，这里一样的，都是为了好区分不同实例
// 2、vm._isVue = true
// 3、merge options: vm.$options
// 4、vm._renderProxy = vm； // 自身代理
// 5、vm._self = vm； 

// 这里这三块我们重点来分析下
// 6、initLifecycle(vm)
// 7、initEvents(vm)
// 8、initRender(vm)

// initLifecycle(vm)
// 初始化生命周期状态及上下文
// $parent、$root、$children、$refs、_isMounted、_isDestroyed等

// initEvents(vm)
// 初始化事件状态及上下文
// _events、_hasHookEvent

// initRender(vm)
// 初始化渲染状态及上下文
// _vnode、_staticTrees、$slots、$scopedSlots、_c、$createElement等
```

### 2、处理options
```js
// 处理options

// initInjections(vm) //  处理注入的
// initState(vm)    // 处理state
// initProvide(vm)  // 处理需要提供其它组件用的

// 我们这里重点来分析下initState(vm)

export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

// 根据这里我们得知，初始化顺序为props、methods、data、computed、watch
// 所以，data中可以使用props和methods，
// computed、watch可以使用props、methods、data
// watch可以使用computed的

// 下面来分析下initProps、initMethods、initData、initComputed、initWatch

// 1、initProps
// 检查是否符合规范的value

// 2、initMethods
// key冲突检查、value是否function检查
// 绑定this：bind(methods[key], vm)
// this访问：vm[key] = bind(methods[key], vm)


// 3、initData
// 获取到return的对象
// key冲突检查
// this代理：proxy(vm, `_data`, key)
// 给data加上observe：observe(data, true /* asRootData */)

// 4、initComputed
// key冲突检查
// 依赖收集：defineComputed(vm, key, userDef)

// 5、initWatch
// 创建watch
```

### 3、走mount
```js
if (vm.$options.el) {
    vm.$mount(vm.$options.el)
}

// 因为我们使用的是web编译版本，我们的$mount是在编辑文件那里覆盖的
const mount = Vue.prototype.$mount;// 这里是web版本的$mount，编辑的走完会走这里
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}

// 这里主要就是解析template,然后再调用web版本的$mount
// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}

// 也就是进入mountComponent方法。
```


## 三、Vue响应式原理

```js
// 我们在上面介绍的时候，关于响应式相关的没有展开来细说
// 为了更好的理解new Vue()的细节，及mountComponent的后续动作。我们先暂停上面的分析。
// 进入Vue响应式原理的理解
```

### 1、原理简介
```js
// 观察者模式和发布订阅模式的区别？
// 就看有没有中间人来统一调度，有中间人调度就是发布订阅模式，如头条新闻。没有则是观察者模式，addEventLister()
// 从另外一个角度来看，也就是订阅者（观察者）的时候，是否需要知道发布者（目标），
// 如果需要知道目标，如addEventLister('load')，观察的目标就是具体的load。则是观察者
// 如果不需要知道目标，也就是订阅笼统目标（调度中心），则为发布订阅模式。如我订阅了军事频道，谁发布的我不在乎（和具体目标解偶）。

// Vue使用的是观察者模式，因为:不管是正常的watch还是渲染watch。都是类似下面的结构
watch:{
    color(){

    }
}
// 也就是有明确需要观察的目标，只不过中间有调度处理逻辑。

// 正常观察者模式
//               目标（Observer）
//     (notice) ↓   ↑
//              ↓   ↑(watch)
//              观察者（Watcher）


// 我们以上面的color来举例
// 1、目标是color
// 2、观察者是handle句柄
```

```js
// vue做了什么

// 第一步，把目标转换为Observer,属性转化为defineReactive
// 第二步，创建一个Watch。完成依赖收集。
// 第三步，触发更新

// 总结

// 第一步，把目标转换为Observer,属性转化为defineReactive
// 总结：深度遍历，key转换为defineReactive。value尝试转换为Observer。
// 1、defineReactive和Observer都有自己的dep来存储Watcher


// 第二步，创建一个Watch。完成依赖(dep)收集。
// 总结：依赖收集(Watcher和dep都会存储对方，所以解除关系的时候，也是需要两边解除)
// 1、Watcher收集依赖（dep）
// 2、依赖(dep)收集Watcher

// 第三步，触发更新

```

```js
// 第一步，把目标转换为Observer,属性转化为defineReactive

// 源码1
export function observe(){
    // 略
    let ob = undefined;
    if(
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
    ){
       ob = new Observer(value) // 这里value，举例为this.$data值
    }
    return ob
}
// 源码2
// new Observer后，会触发这里，也就是给obj的每个属性，转换为defineReactive
walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i])
    }
}
// 源码3
// 给key增加为defineReactive,然后会判断key的value是否增加为Observer
// 也就是如果该对象是多层的，会一直遍历下去。
export function defineReactive(/*略*/){
    // 尝试给key的value,observe
    // 也就是回到源码1，会一直遍历下去
    let childOb = !shallow && observe(val)
}

// 我们拿个例子来完整描述下这个过程
data(){
    return {
        color:'red',
        data1:{x:1,y:[]},
        list:[1,{x:2}]
    }
},

// 1、创建一个data的Observer
// 2、遍历data的key
// 3、给color定义为defineReactive
// 4、给data1定义为defineReactive。
// 5、因为data1的值是引用，给data1的值定义为Observer
// 6、遍历data1的key
// 7、给x定义为defineReactive
// 8、给y定义为defineReactive
// 9、因为y的值是引用类型,给y的值定义为Observer
// 10、遍历y的key
// 11、遍历完data1。回到data的key遍历，也就是到了list
// 12、给list定义为defineReactive
// 13、因为list的值是引用类型,给list的值定义为Observer
// 14、遍历list的key
// 15、遇到值是引用类型的{x:2},把{x:2}定义为Observer
// 16、遍历{x:2}的key
// 17、给x定义为defineReactive
// 18、完成{x:2}的遍历
// 19、完成list的遍历
// 20、完成data的遍历

// 创建一个data的Observer
--Observer Dep {id: 2, subs: Array(0)} {color: 'red', data1: {…}, list: Array(2)}
// 给color定义为defineReactive
--defineReactive Dep {id: 3, subs: Array(0)} {color: 'red', data1: {…}, list: Array(2), __ob__: Observer} color
// 给data1定义为defineReactive。
--defineReactive Dep {id: 4, subs: Array(0)} {data1: {…}, list: Array(2), __ob__: Observer} data1
// 给data1的值定义为Observer
--Observer Dep {id: 5, subs: Array(0)} {x: 1, y: Array(0)}
// 给x定义为defineReactive
--defineReactive Dep {id: 6, subs: Array(0)} {x: 1, y: Array(0), __ob__: Observer} x
// 给y定义为defineReactive
--defineReactive Dep {id: 7, subs: Array(0)} {y: Array(0), __ob__: Observer} y
// 给y的值定义为Observer
--Observer Dep {id: 8, subs: Array(0)} []
// 给list定义为defineReactive
--defineReactive Dep {id: 9, subs: Array(0)} {list: Array(2), __ob__: Observer} list
// 给list的值定义为Observer
--Observer Dep {id: 10, subs: Array(0)} (2) [1, {…}]
// 给{x:2}定义为Observer
--Observer Dep {id: 11, subs: Array(0)} {x: 2}
// 给x定义为defineReactive
--defineReactive Dep {id: 12, subs: Array(0)} {x: 2, __ob__: Observer} x

// 总结：
// 遇到对象属性，把其属性定义为defineReactive.
// 然后判断其值是否是引用，如果是,则把其值，定义为Observer，同样规则遍历其自身属性
// 直到遍历完
// 简单理解：引用类型就是一个Observer。

// 关于dep
// 不管是属性的defineReactive还是值的Observer，都有dep来记录观察者。且dep的id会自增来区分不同的dep

// 区别
// Observer中的
def(value, '__ob__', this)
// 如上面例子中，data1的值{x:1,y:[]}创建一个Observer，然后就会转换为{x:1,y:[],__ob__:当前Watch}
// 我们打印vm来可以观察到

// defineReactive中
// 因为是对属性，添加描述符，本身key没办法存储，所以这边采用的是闭包来存储
```

```js
// 第二步，创建一个Watch。完成依赖收集。

// 1、创建一个Watch
// 2、执行get
get(){
    // 提供上下文：把当前Watch注册到Dep的静态属性中
    pushTarget(this);
    value = this.getter.call(vm, vm)
    // 移除上下文
    popTarget()
    this.cleanupDeps(); // 这里后面会描述
}
// 3、触发目标的getter(完成依赖收集)
get: function reactiveGetter () {
    const value = getter ? getter.call(obj) : val
    // Dep.tatget就是上面提供的上下文
    if (Dep.target) {
        // 此时，触发依赖收集
        dep.depend()
        if (childOb) {
            // 如果子属性值，也是Observet。则也会依赖收集。这里会回调
            childOb.dep.depend()
            if (Array.isArray(value)) {
            dependArray(value)
            }
        }
    }
    return value
},
// 5、目标变动的时候，也就是set时,则触发目标收集的dep更新
set: function reactiveSetter (newVal) {
    const value = getter ? getter.call(obj) : val
    /* eslint-disable no-self-compare */
    if (newVal === value || (newVal !== newVal && value !== value)) {
    return
    }
    /* eslint-enable no-self-compare */
    if (process.env.NODE_ENV !== 'production' && customSetter) {
    customSetter()
    }
    // #7981: for accessor properties without setter
    if (getter && !setter) return
    if (setter) {
    setter.call(obj, newVal)
    } else {
    val = newVal
    }
    // 生成新的childOb
    childOb = !shallow && observe(newVal)
    // 触发dep更新
    dep.notify()
}

// 说明：
// 1、这里描述了Watch提供上下文，get触发依赖收集，set触发依赖更新
// 术语：依赖。其实就是目标。

// 下面我们重点来分析下怎么收集的。及细节
dep.depend()

// 我们来看下这个方法（src/core/observer/dep.js）
depend () {
    if (Dep.target) {
        Dep.target.addDep(this)
    }
}
// 会触发 Dep.target.addDep(this)
// 也就是Watcher.addDep(this)
// 也就是当前Watcher会收集依赖（目标）

// 我们来看下这个方法（src/core/observer/watcher.js）
addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
        this.newDepIds.add(id)
        this.newDeps.push(dep)
        if (!this.depIds.has(id)) {
        dep.addSub(this)
        }
    }
}
// Watch需要两个数组，来存储依赖。这样才知道差一点，后续差异的才让其依赖移除自身Watch
// 这块逻辑为：重新收集依赖，如果旧的依赖数组中没有，则添加
// 此时，会触发 dep.addSub(this)。

// 我们来看下这个方法（src/core/observer/dep.js）
addSub (sub: Watcher) {
    this.subs.push(sub)
}
// 也就是，收集不止是Watch在收集依赖(目标)，依赖也在收集Watcher。

// 直到完成依赖收集

// 我们再来看下Watcher的get方法
get(){
    // 提供上下文：把当前Watch注册到Dep的静态属性中
    pushTarget(this);
    value = this.getter.call(vm, vm)
    // 移除上下文
    popTarget()
    this.cleanupDeps(); // 这里后面会描述
}
// 我们来看下this.cleanupDeps(
cleanupDeps () {
    let i = this.deps.length
    while (i--) {
        const dep = this.deps[i]
        if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
        }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
}
// 我们刚才是往newDepIds和depIds上面添加了新的依赖。
// 如果旧的依赖中有些是不需要的。则触发依赖移除当前Watch（所以为什么需要两个数组，差异的才移除）
// 当然我们也可以一个数组来实现。先解除收有的依赖关系，当然这个没这么好。
```

```js
// 触发更新


```
### 2、Vue响应式其它细节

```js
// 1、观察者模式
watch:{
    color(){

    }
}

// 2、Vue怎么建立的这个观察者模式
//    第一步，让data增加响应(key转化为defineReactive,值转换为Observer)
//    第二步，创建Watcher。给Dep.target添加当前Watch。然后触发目标的getter，从而把当前watch收集到其dep

// 3、效果：目标set时，会触发其收集的dep触发update。
```