# new Vue()

```js
// 前面我们有分析Vue构造器，现在我们来分析下vm

// 我们先来思考下，new Vue(options)需要做什么

// 前面我们有分析Vue的构造器，注册了大量的静态方法和原型方法/属性

// 1、初始化一系列的状态来存储自己状态及相关上下文
// 2、处理options
// 3、走$mount

// 结果也是如此
```

```js
// 源码

// new Vue(options)入口
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

## 一、初始化一系列的状态

```js
// 初始化一系列状态及上下文
// 1、vm._uid = uid++; // 前面我们有看到构造器的cid也会自增，这里一样的，都是为了好区分不同实例
// 2、vm._isVue = true // a flag to avoid this being observed
// 3、merge options: vm.$options
// 4、vm._renderProxy = vm； // 自身代理
// 5、vm._self = vm；

// 核心部分
initLifecycle(vm)
initEvents(vm)
initRender(vm)
```
### 1、initLifecycle(vm)

```js
// 初始化生命周期状态及上下文
// $parent、$root、$children、$refs、_isMounted、_isDestroyed等
```
### 2、initEvents(vm)

```js
// 初始化事件状态及上下文
// _events、_hasHookEvent
```

### 3、initRender(vm)

```js
// 初始化渲染状态及上下文
// _vnode、_staticTrees、$slots、$scopedSlots、_c、$createElement等
```

## 二、处理options

```js
// 核心部分，也就是处理注入，state(props、data、methods、computed、watch)、提供
initInjections(vm) // resolve injections before data/props
initState(vm)
initProvide(vm) // resolve provide after data/props

// 下面我们重点来分析下initState(vm)
```
### 1、initState(vm)

```js
// 入口：src/core/instance/state.js

// 源码：
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
```
```js
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

## 三、走$mount

```js
// 回看_init（）方法中的这段
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

// 这里涉及到Watcher知识了。我们先学习Vue的响应式原理，再回头再看这部分
// 完成响应式原理demo1和demo2后，我们直接进入到updateComponent章节吧。
```

## 三、测试

通过上面的过程，我们对new Vue(options)的实例化，有个整体认识。
那我们输出vm来看下其对象结构，让我们对其有更清晰的认识。

```html
<!-- 测试代码 -->
<script type="module">
    import Vue from './vue.esm.browser.js';
    const vm = new Vue({
        name:"hcl",
        data(){
            return {
                list:[1,2,3],
                color:'red'
            }
        }
    })
    console.dir(vm)
</script>
```
```js
// 输出
{
    // 初始化一系列状态及上下文
    _uid: 0
    _isVue: true
    $options: {components: {…}, directives: {…}, filters: {…}, name: 'hcl', _base: ƒ, …}
    _renderProxy: Proxy {_uid: 0, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: Vue, …}
    _self: Vue {_uid: 0, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: Vue, …}

    // initLifecycle(vm)    
    $parent: undefined
    $attrs: (...)
    get $attrs: ƒ reactiveGetter()
    set $attrs: ƒ reactiveSetter(newVal)
    $listeners: (...)
    get $listeners: ƒ reactiveGetter()
    set $listeners: ƒ reactiveSetter(newVal)
    $root: Vue {_uid: 0, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: Vue, …}
    $refs: {}
    $children: []
    _isBeingDestroyed: false
    _isDestroyed: false
    _isMounted: false
    _directInactive: false
    _inactive: null
    _watcher: null
    _watchers: []

    // initEvents(vm)
    _events: {}
    _hasHookEvent: false

    // initRender(vm)
    _vnode: null
    _staticTrees: null
    $scopedSlots: {}
    $slots: {}
    $vnode: undefined
    $createElement: (a, b, c, d) => createElement(vm, a, b, c, d, true)
    _c: (a, b, c, d) => createElement(vm, a, b, c, d, false)

    // 处理options
    $props: undefined
    color: "red"
    get color: ƒ proxyGetter()
    set color: ƒ proxySetter(val)
    list: Array(3)
    get list: ƒ proxyGetter()
    set list: ƒ proxySetter(val)
    $data: (...)
}

// 关于id说明：
// 1、不同Vue构造器： Sub.cid = cid++
// 2、不同vm： vm._uid = uid++
// 3、不同dep：this.id = uid++
// 等等。
// 也就是，同一类型，会用自增的id来区分。掌握这个，对我我们看不同Vue的对象，有帮助。
```

## 四、总结

```js
// 这节我们有分析new Vue(options)的过程

// 1、初始化一系列的状态来存储自己状态及相关上下文
// 2、处理options
// 3、走$mount

// 再深入涉及到Watcher。为了深入学习这部分知识，我们先来学习下Vue的响应式原理
```