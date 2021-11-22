# Vue构建具体分析

```js
// demo1有分析构建过程，及源码展示
// 这边详细的来分析

// 1、Vue添加原型
// 2、Vue添加静态方法
// 3、Vue添加平台差异(web)
// 4、Vue添加功能差异（编译）
```
## 一、Vue添加原型

```js
// 入口 import Vue from './instance/index'

// 源码
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

// 我们发现，在往Vue原型上面添加各种方法
```
### 1、initMixin(Vue)

```js
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {/*略*/ }
}
// 原型挂载：init方法
// _init方法
```

### 2、stateMixin(Vue)

```js
export function stateMixin (Vue: Class<Component>) {
    Object.defineProperty(Vue.prototype, '$data', {get(){return this._data},set(){warn('readOnly')}})
    Object.defineProperty(Vue.prototype, '$props',{get(){return this._props},set(){warn('readOnly')}})

    Vue.prototype.$set = set
    Vue.prototype.$delete = del
    Vue.prototype.$watch = (expOrFn,cb,options){/*略*/}
}
// 原型挂载：数据相关的
// $data、$props、$set、$delete、$watch
```

### 3、eventsMixin(Vue)

```js
export function eventsMixin (Vue: Class<Component>) {
    Vue.prototype.$on = function(event,fn){/*略*/}
    Vue.prototype.$once = function(event,fn){/*略*/}
    Vue.prototype.$off = function(event,fn){/*略*/}
    Vue.prototype.$emit = function(event){/*略*/}
}
// 原型挂载：事件相关的
// $on、$once、$off、$emit
```

### 4、lifecycleMixin(Vue)

```js
export function lifecycleMixin (Vue: Class<Component>) {
    Vue.prototype._update = function (vnode, hydrating) {/*略*/}
    Vue.prototype.$forceUpdate = function () {/*略*/}
    Vue.prototype.$destroy = function (/*略*/) {
}
// 原型挂载：生命周期相关的
// _update、$forceUpdate、$destroy
```

### 5、renderMixin(Vue)

```js
export function renderMixin (Vue: Class<Component>) {
    // 原型上面挂载渲染的一些方法,方法名都是_x。如_o，_n，_s，_l
    installRenderHelpers(Vue.prototype)
    Vue.prototype.$nextTick = function (fn: Function) {return nextTick(fn, this)}}
    Vue.prototype._render = = function (): VNode {/*略*/}
}
// 原型挂载：渲染相关的
// _o，_n，_s，_l等渲染help方法，$nextTick，_render
```
## 二、Vue添加静态方法
这里添加的，也就是[全局配置、全局API](https://cn.vuejs.org/v2/api/)

```js
// 入口：src/core/index.js

// 源码
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

// 这里我们主要关注initGlobalAPI(Vue)
```

### 1、initGlobalAPI(Vue)

```js
// 入口

// 源码
export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)
 // util
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  Vue.observable =(obj: T) => {
    observe(obj)
    return obj
  }

  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  Vue.options._base = Vue

  extend(Vue.options.components, builtInComponents)

  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}
```

## 三、Vue添加平台差异(web)
目前Vue支持web、week不同平台，这里是关于web的差异

```js
// 入口：src/platforms/web/runtime/index.js

// 部分代码
import Vue from 'core/index'
// 略
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop
Vue.prototype.$mount = function(el,hydrating){/*略*/}

// 也就是添加平台差异
// 1、如tag、attrs等
// 2、如指令（model、show）、组件（Transition、TransitionGroup）
// 3、__patch__
// 4、$mount
```

## 四、Vue添加功能差异（编译）

```js
// 入口：src/platforms/web/entry-runtime-with-compiler.js

// 部分源码

// 重写$mount
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (){
    // 这里略，主要就是把template代码，转换为render。
    // 然后再走web版本的mount
    return mount.call(this, el, hydrating)
}

// 添加编译功能
Vue.compile = compileToFunctions
```

## 五、测试

通过上面的过程，我们对Vue的整体构造过程及添加了什么方法，有个整体认识。
那我们输出Vue来看下其对象结构，让我们对其有更清晰的认识。

```html
<!-- 测试代码 -->
<script type="module">
    import Vue from './vue.esm.browser.js';
    console.dir(Vue)
</script>
```
```js
// 输出
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

// 我们再来看下原型
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

## 六、总结

```js
// 我们在这里重点分析了Vue的构造器
// 下面我们来分析下vm的实例化
```