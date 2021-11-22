# updateComponent

我们来看下组件更新是怎么做的
## 一、介绍

```js
// 前面vm章节，有介绍vm的实例话过程
// 前面reactive章节，我们有介绍响应式原理和渲染Watcher
// 在这些知识前提下，我们进入组件是怎么更新的

// 在_init（）方法中的这段
if (vm.$options.el) {
    vm.$mount(vm.$options.el)
}
// 或，我们手动指向$mount方法。

// 从Vue构建我们得知，$mount的执行顺序为：
// 1、走compiler的$mount：把template转换为render
// 2、再走web版本的runtime的$mount

// 我们直接来看runtime的$mount
// 入口：src/platforms/web/runtime/index.js
// 部分源码
import { mountComponent } from 'core/instance/lifecycle'
// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}

// 我们再看下mountComponent方法。

// 入口：src/core/instance/lifecycle.js
// 部分代码（简化版）
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  callHook(vm, 'beforeMount')

  let updateComponent = () => {
      vm._update(vm._render(), hydrating)
  }

  // 创建渲染Watcher
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}

// 从Watcher要处理的事情来看Watcher!!!(理解这个对选项和Watcher的功能会更透彻)
// Watcher。要处理的可以认为两部分
// 1、value（获取value的过程就会依赖收集）
//    value由lazy控制是否立马获取，只能用于computedWatch
// 2、执行cb
//    cb由sync(派发后同步执行cb，不仅调度队列)，immediate（初始化后，立马执行，而非调度触发）控制

// 我们知道，非lazy会立马执行this.get()
// 也就是进入
let updateComponent = () => {
    vm._update(vm._render(), hydrating)
}

// 我们再来看下Vue的生命周期
// 1、一开始是不会触发cb的。也就是只有依赖派发，才会执行cb。和这里我们看到的是一致的
// 因为执行cb。会执行before的：callHook(vm, 'beforeUpdate')

//  OK，我们直接进入updateComponent吧。
```

## 二、updateComponent()

```js
let updateComponent = () => {
    vm._update(vm._render(), hydrating)
}
```

### 1、vm._render()

```js
// 我们回到Vue构造器部分，那里有介绍_render的挂载

// 入口：src/core/instance/render.js
export function renderMixin (Vue: Class<Component>) {
    // 原型上面挂载渲染的一些方法,方法名都是_x。如_o，_n，_s，_l
    installRenderHelpers(Vue.prototype)
    Vue.prototype.$nextTick = function (fn: Function) {return nextTick(fn, this)}}
    Vue.prototype._render = = function (): VNode {/*略*/}
}
// 原型挂载：渲染相关的
// _o，_n，_s，_l等渲染help方法，$nextTick，_render

// 我们来看下_render方法。
```
```js
// 入口：src/core/instance/render.js

// 源码（精简版）
export let currentRenderingInstance: Component | null = null
Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options
    
    // 从父节点获取$scopedSlots
    if (_parentVnode) {
        vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
        )
    }
    vm.$vnode = _parentVnode

    // 开始渲染
    let vnode
    try {
        // currentRenderingInstance 记录当前渲染的vm
        currentRenderingInstance = vm
        // 开始生成vnode
        vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
        // 略
    } finally {
        currentRenderingInstance = null
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
}

// 重点关注
// render.call(vm._renderProxy, vm.$createElement)

// 其中，render
// 前面我们有介绍，因为我们使用vue.esm.browser.js 版本
// 在src/platforms/web/entry-runtime-with-compiler.js会重写$mount
// 此时，会执行这里，也就是编译版本，会把template转换成render。然后再执行runtime的$mount
const { render, staticRenderFns } = compileToFunctions(template, {
    outputSourceRange: process.env.NODE_ENV !== 'production',
    shouldDecodeNewlines,
    shouldDecodeNewlinesForHref,
    delimiters: options.delimiters,
    comments: options.comments
}, this)
options.render = render
options.staticRenderFns = staticRenderFns

// 这里的render。和我们手敲的render差不多。
// 如
`<div id="app">
    {{color}}
    <child1 :num="3"></child1>
</div>`
// 会转换为render
ƒ anonymous(
) {
    with(this){return _c('div',{attrs:{"id":"app"}},[_v("\n        "+_s(color)+"\n        "),_c('child1',{attrs:{"num":3}})],1)}
}

// 然后我们再来看下立马执行的
// render.call(vm._renderProxy, vm.$createElement)

// 我们正常敲render(h){return h('div',null,'hello Word')}。这里的h就是vm.$createElement
```
### 2、render.call(vm._renderProxy, vm.$createElement)

```js
`<div id="app">
    {{color}}
    <child1 :num="3"></child1>
</div>`
// 会转换为render
ƒ anonymous(
) {
    with(this){return _c('div',{attrs:{"id":"app"}},[_v("\n        "+_s(color)+"\n        "),_c('child1',{attrs:{"num":3}})],1)}
}

// 从这里我们发现有很多方法。_c、_v、_s等。
// 入口：src/core/instance/render.js
export function renderMixin (Vue: Class<Component>) {
    // 原型上面挂载渲染的一些方法,方法名都是_x。如_o，_n，_s，_l
    installRenderHelpers(Vue.prototype)
    Vue.prototype.$nextTick = function (fn: Function) {return nextTick(fn, this)}}
    Vue.prototype._render = = function (): VNode {/*略*/}
}
// 定义在installRenderHelpers(Vue.prototype)
// 我们进去看下
// 入口：src/core/instance/render-helpers/index.js
export function installRenderHelpers (target: any) {
  target._o = markOnce
  target._n = toNumber
  target._s = toString
  target._l = renderList
  target._t = renderSlot
  target._q = looseEqual
  target._i = looseIndexOf
  target._m = renderStatic
  target._f = resolveFilter
  target._k = checkKeyCodes
  target._b = bindObjectProps
  target._v = createTextVNode
  target._e = createEmptyVNode
  target._u = resolveScopedSlots
  target._g = bindObjectListeners
  target._d = bindDynamicKeys
  target._p = prependModifier
}

// 其中 _c是在_init的initRender(vm)中定义的
Vue.prototype._init = function (options?: Object) {
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')
    // 其它略
}
export function initRender (vm: Component) {
    // 这个是内部用的，如上面的_c
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
    // 这个是给用户用的
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
    // 其它略
}

// 从这里我们发现主要是_c或者说$createElement。其它的是renderx帮助函数，我们后面再看
```

### 3、createElement

```js
// 入口：src/core/vdom/create-element.js
// 从这里开始，我们进入Vnode的领域

// 源码
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
    // 我们正常这里是Object。如果是数组或基本数据类型，会处理下参数
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}

// 这里主要是格式化参数，统一入口，我们进入_createElement
// 看这部分内容，如果对createElement不是很熟，先看下这里。这样看源码会容易很多
https://cn.vuejs.org/v2/guide/render-function.html#createElement-%E5%8F%82%E6%95%B0
```

### 4、_createElement（）

```js
// 入口：src/core/vdom/create-element.js

// 源码
export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  // 1、 判断data
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  // 2、处理tag
  // 用于<component :is></component>
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // 3、处理children
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  // 4、正式进入生成Vnode
  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    // 获取tag命名空间
    // 注意，这里的getTagNamespace，isReservedTag这个是和平台相关的
    // 这里用的是web的。入口：src/platforms/web/runtime/index.js
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    // 判断是否预设tag
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn) && data.tag !== 'component') {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}

// OK。代码比较多。我们精简下来看下
export function _createElement(){
    // 入参合法性判断
    // 其它处理
    // 正式进入生成Vnode
    if(typeof tag === 'string') {
        if (config.isReservedTag(tag)) {
            // 如果是保留的tag
            vnode = new VNode(
                config.parsePlatformTagName(tag), data, children,
                undefined, undefined, context
            )
        } else if((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))){
            // resolveAsset 会在context.$options[components] 中，用tag或小写或转驼峰的方式，找有没有这个属性
            // 也就是判断是不是我们注册了的组件（全局组件，也会在vm.$options[components]）
            vnode = createComponent(Ctor, data, context, children, tag)
        } else {
            // 其它情况，正常把它渲染吧
            vnode = new VNode(
                tag, data, children,
                undefined, undefined, context
            )
        }
    } else {
        // tag除了字符串，还支持函数，Object。
        // 官网有介绍：https://cn.vuejs.org/v2/guide/render-function.html#createElement-%E5%8F%82%E6%95%B0
        vnode = createComponent(tag, data, context, children)
    }
    // 后续逻辑先略
}

// 总结：
// 这里就是根据不同情况，来准备进new VNode()
// createComponent里面是较复杂逻辑处理，后序也是进new VNode()
```

### 5、中间小结

```js
// 我们马上要进入Vnode了。在这之前，我们小结下

// 1、进入$mount：$mount(el,hydrating)
// 2、执行mountComponent：mountComponent(this, el, hydrating)
//    创建渲染Watcher。触发vm._update(vm._render(), hydrating)
// 3、执行vm._render()：
//    执行render.call(vm._renderProxy, vm.$createElement)
//    在render中，with(this),执行this中的渲染相关方法和读取属性
//    最重要的是_c和$createElement
//    这两个在initRender时，就挂载在vm上了
//    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
//    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
// 4、我们来分析下createElement
// 5、createElement：主要就是统一入口，处理下参数
// 6、然后会进入到_createElement：这里就是创建Vnode的逻辑处理，处理逻辑，然后传参进new Vnode()
// 7、进入new Vnode()

// new Vnode()就是我们接下里要重点分析的
```
### 6、new Vnode()

```js
// 入口：src/core/vdom/vnode.js

// 我们先拿预设tag的入参来看下
vnode = new VNode(
    config.parsePlatformTagName(tag),
    data,
    children,
    undefined,
    undefined,
    context
)

// 源码
export default class VNode {
  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}

export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}

export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}

// 也就是一个Object。来表示一个tag
// 我们输出组件一个来看看
VNode {
    tag: 'vue-component-1-child1', //  `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data: {…},
    children: undefined,
    text: undefined,
    elm: undefined, …}
    asyncFactory: undefined
    asyncMeta: undefined
    children: undefined
    componentInstance: VueComponent {_uid: 1, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: VueComponent, …}
    componentOptions: {propsData: {…}, listeners: undefined, tag: 'child1', children: undefined, Ctor: ƒ}
    context: Vue {_uid: 0, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: Vue, …}
    data: {attrs: {…}, on: undefined, hook: {…}, pendingInsert: null}
    elm: div
    fnContext: undefined
    fnOptions: undefined
    fnScopeId: undefined
    isAsyncPlaceholder: false
    isCloned: false
    isComment: false
    isOnce: false
    isRootInsert: false
    isStatic: false
    key: undefined
    ns: undefined
    parent: undefined
    raw: false
    [[Prototype]]: Object
}

// 我们再输出一个预设的tag看看
VNode {
    tag: 'div',
    data: {…},
    children: Array(2),
    text: undefined,
    elm: undefined, …}
    asyncFactory: undefined
    asyncMeta: undefined
    children: (2) [VNode, VNode]
    componentInstance: undefined  // 这个只有组件的Vnode才有值
    componentOptions: undefined   // 这个只有组件的Vnode才有值
    context: Vue {_uid: 0, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: Vue, …}
    data: {attrs: {…}}
    elm: div#app
    fnContext: undefined
    fnOptions: undefined
    fnScopeId: undefined
    isAsyncPlaceholder: false
    isCloned: false
    isComment: false
    isOnce: false
    isRootInsert: true
    isStatic: false
    key: undefined
    ns: undefined
    parent: undefined
    raw: false
    [[Prototype]]: Object
}

// OK。我们看到Vnode长什么样子后。我们接着继续
```
### 8、回到mountComponent()
```js
// 我们再回顾下，前面的流程

// 1、进入$mount：$mount(el,hydrating)
// 2、执行mountComponent：mountComponent(this, el, hydrating)
//    创建渲染Watcher。触发vm._update(vm._render(), hydrating)
// 3、执行vm._render()：
//    执行render.call(vm._renderProxy, vm.$createElement)
//    在render中，with(this),执行this中的渲染相关方法和读取属性
//    最重要的是_c和$createElement
//    这两个在initRender时，就挂载在vm上了
//    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
//    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
// 4、我们来分析下createElement
// 5、createElement：主要就是统一入口，处理下参数
// 6、然后会进入到_createElement：这里就是创建Vnode的逻辑处理，处理逻辑，然后传参进new Vnode()
// 7、进入new Vnode()
```
```js
// 入口：src/core/instance/lifecycle.js

// 源码(精简版)
export function mountComponent (){
    callHook(vm, 'beforeMount')
    // 回到这里
    // 前面，我们走vm._render(),到new Vnode()
    // 也就是返回了Vnoe
    // 我们进入_update
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
    new Watcher(vm, updateComponent, noop, {
        before () {
        if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate')
        }
        }
    }, true /* isRenderWatcher */)
    if (vm.$vnode == null) {
        vm._isMounted = true
        callHook(vm, 'mounted')
    }
    return vm
}
```
### 9、vm._update()
```js
// 从前面Vue构造器，我们知道_update是在lifecycleMixin(vm)时挂载上去的

// 入口：src/core/instance/lifecycle.js

// 源码：
export function lifecycleMixin (Vue: Class<Component>) {
    Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
        const vm: Component = this
        const prevEl = vm.$el
        const prevVnode = vm._vnode
        // activeInstance存储当前激活的vm实例
        // setActiveInstance会存储之前激活的vm实例。调用返回函数后。又回重置回去。
        const restoreActiveInstance = setActiveInstance(vm)
        vm._vnode = vnode
        // Vue.prototype.__patch__ is injected in entry points
        // based on the rendering backend used.
        if (!prevVnode) {
            // 初始化渲染
            // initial render
            vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
        } else {
            // 更新的时候
            // updates
            vm.$el = vm.__patch__(prevVnode, vnode)
        }
        restoreActiveInstance()
        // update __vue__ reference
        if (prevEl) {
            prevEl.__vue__ = null
        }
        if (vm.$el) {
            vm.$el.__vue__ = vm
        }
        // if parent is an HOC, update its $el as well
        if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
            vm.$parent.$el = vm.$el
        }
        // updated hook is called by the scheduler to ensure that children are
        // updated in a parent's updated hook.
    }
    Vue.prototype.$forceUpdate = function () {/*略*/} 
    Vue.prototype.$destroy = function () {/*略*/}
}

// setActiveInstance
export function setActiveInstance(vm: Component) {
  const prevActiveInstance = activeInstance
  activeInstance = vm
  return () => {
    activeInstance = prevActiveInstance
  }
}
```
### 10、__patch__()

```js
// 上面源码也备注了，这个方法是Vue.prototype.__patch__ is injected in entry points
// 也就是在web版

// 入口：src/platforms/web/runtime/index.js
Vue.prototype.__patch__ = inBrowser ? patch : noop

// patch定义在：src/platforms/web/runtime/patch.js
export const patch: Function = createPatchFunction({ nodeOps, modules })

// createPatchFunction定义在：src/core/vdom/patch.js
// 代码非常的长

// 我们在这里先注意下

// 1、vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
//    也就是，我们主要入参，是vm.$el, vnode。返回的是vm.$el
//    _update函数中，后序也没有对$el其它操作，也就是vm.__patch__。已经完成Vnode渲染到浏览器。
//    这里只是返回$el，更新vm.$el而已
// 2、createPatchFunction({ nodeOps, modules })这里是生成patch
//   nodeOps:提供web相关增删改查节点的方法
//   modules：提供attrs/style/class/event等在不同hook时的操作
//   也就是让Vnode的值，更新到document
//   return 返回的是一个函数，也就是__patch__()

// ok。我们根据这些预备知识，正式进入createPatchFunction
```

### 11、createPatchFunction（{ nodeOps, modules }）

```js
// 入口：src/core/vdom/patch.js

// 源码（精简版）
// 节点的生命周期
const hooks = ['create', 'activate', 'update', 'remove', 'destroy']
function createPatchFunction (backend) {
    let i, j;
    const cbs = {};
    const { modules, nodeOps } = backend;
    // 把各个模块，不同hooks的操作逻辑，注册到cbs
    for (i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            if (isDef(modules[j][hooks[i]])) {
                cbs[hooks[i]].push(modules[j][hooks[i]]);
            }
        }
    }
    // 下面是20多个函数，具体内容先略
    /**
     * emptyNodeAt
     * createRmCb
     * removeNode
     * isUnknownElement
     * createElm
     * createComponent
     * initComponent
     * reactivateComponent
     * insert
     * createChildren
     * isPatchable
     * invokeCreateHooks
     * setScope
     * addVnodes
     * invokeDestroyHook
     * removeVnodes
     * removeAndInvokeRemoveHook
     * updateChildren
     * checkDuplicateKeys
     * findIdxInOld
     * patchVnode
     * invokeInsertHook
     * hydrate
     * assertNodeMatch
     **/

    //  OK。我们使用的__patch。是在这里定义的
    // 我们来看下
    return function patch (oldVnode, vnode, hydrating, removeOnly) {
        // 如果没有新节点
        if (isUndef(vnode)) {
            // 此时，如果有旧节点,走unmount
            if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
            return
        }

        let isInitialPatch = false
        const insertedVnodeQueue = []
        // 如果没有旧节点，说明只需要插入就行
        if (isUndef(oldVnode)) {
            // empty mount (likely as component), create new root element
            isInitialPatch = true
            createElm(vnode, insertedVnodeQueue)
        } else {
            // 否则，要走diff
            // 判断是不是节点
            const isRealElement = isDef(oldVnode.nodeType)
            // 如果不是html节点，判断是不是相同组件
            if (!isRealElement && sameVnode(oldVnode, vnode)) {
                // patch existing root node
                patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
            } else {
                if (isRealElement) {
                    // mounting to a real element
                    // check if this is server-rendered content and if we can perform
                    // a successful hydration.
                    if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                        oldVnode.removeAttribute(SSR_ATTR)
                        hydrating = true
                    }
                    if (isTrue(hydrating)) {
                        if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                        invokeInsertHook(vnode, insertedVnodeQueue, true)
                        return oldVnode
                        } else if (process.env.NODE_ENV !== 'production') {
                        warn(
                            'The client-side rendered virtual DOM tree is not matching ' +
                            'server-rendered content. This is likely caused by incorrect ' +
                            'HTML markup, for example nesting block-level elements inside ' +
                            '<p>, or missing <tbody>. Bailing hydration and performing ' +
                            'full client-side render.'
                        )
                        }
                    }
                    // either not server-rendered, or hydration failed.
                    // create an empty node and replace it
                    oldVnode = emptyNodeAt(oldVnode)
                }

                // replacing existing element
                const oldElm = oldVnode.elm
                const parentElm = nodeOps.parentNode(oldElm)

                // create new node
                createElm(
                    vnode,
                    insertedVnodeQueue,
                    // extremely rare edge case: do not insert if old element is in a
                    // leaving transition. Only happens when combining transition +
                    // keep-alive + HOCs. (#4590)
                    oldElm._leaveCb ? null : parentElm,
                    nodeOps.nextSibling(oldElm)
                )

                // update parent placeholder node element, recursively
                if (isDef(vnode.parent)) {
                    let ancestor = vnode.parent
                    const patchable = isPatchable(vnode)
                    while (ancestor) {
                        for (let i = 0; i < cbs.destroy.length; ++i) {
                        cbs.destroy[i](ancestor)
                        }
                        ancestor.elm = vnode.elm
                        if (patchable) {
                        for (let i = 0; i < cbs.create.length; ++i) {
                            cbs.create[i](emptyNode, ancestor)
                        }
                        // #6513
                        // invoke insert hooks that may have been merged by create hooks.
                        // e.g. for directives that uses the "inserted" hook.
                        const insert = ancestor.data.hook.insert
                        if (insert.merged) {
                            // start at index 1 to avoid re-invoking component mounted hook
                            for (let i = 1; i < insert.fns.length; i++) {
                            insert.fns[i]()
                            }
                        }
                        } else {
                        registerRef(ancestor)
                        }
                        ancestor = ancestor.parent
                    }
                }
                // destroy old node
                if (isDef(parentElm)) {
                    removeVnodes([oldVnode], 0, 0)
                } else if (isDef(oldVnode.tag)) {
                    invokeDestroyHook(oldVnode)
                }
            }
        }
        invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
        return vnode.elm
    }
}

```
## 三、总结