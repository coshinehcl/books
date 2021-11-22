# watch

```js
// demo1介绍了响应式原理

// 1、理解Vue是怎么感知到，值的改变。
//  defineReactive：为对象set/get服务。拦截setter和getter收集
//  Observer:为数组和对象本身值服务。提供了$set、$delete及重写了数组的方法
// 2、理解Vue是怎么收集依赖的，（Watcher创建时，提供上下文，触发属性目标getter，进而属性和值收集Watcher。同时Watcher也收集依赖）
// 3、当改变时，怎么派发的
//    如果是属性的setter操作，改变了值，则会触发属性的setter，进而触发属性dep收集的依赖派发
//    如果是提供了$delete及重写了数组的方法，改变了值，则会获取值（Observer）的dep，进而触发值dep收集的依赖派发
// 
// 以上是Vue响应式原理。除了这个知识，我们还能收获
// 1、熟悉源码
// 2、更加熟悉vm，我们打印this。看到的内容会比别人多
//   比如，我们能看懂_watcher、_watchers、__ob__、get、set
//   甚至，观察vm我们就知道，某个属性到底是否是响应的，某个Watcher，真实依赖目标有哪些
//   进而我们能比别人更快的定位问题。


// 主要是三大块，目标实名和目标可感知修改、收集依赖、派发

// 一、目标实名和目标可感知修改
//    我们对值的操作，是可捕获的。及关联dep！！！！
//    1、初始化时，会对$data的所有引用Observer处理，对属性defineReactive处理
//    2、当我们修改值或插入了新的值，对新的值也同样处理。
//    这个时候是不会触发依赖收集的！

// 二、依赖收集
//    依赖收集，在我们获取值的时候,具体来说:
//    1、创建Watcher的时候，如果非lazy。则会进入this.get()，进而根据Watcher上下文,获取值时，收集依赖。
//    2、派发触发后，后续会触发Watcher.run()，进而触发Watcher的this.get()，进而根据Watcher上下文,获取值时，重新收集依赖。

// 三、派发
//    1、对象触发setter时，根据旧依赖，触发派发
//    2、$set、$delete、或数组重写的方法，根据旧依赖，触发派发
//    3、派发触发后，后续会触发Watcher.run()，进而触发Watcher的this.get()，进而根据Watcher上下文,获取值时，重新收集依赖。
```
```js
// 这节主要是介绍watch的具体使用
```
## 一、watch的分类

```js
// 从Watcher用途来区分

// 1、用户watch
//    我们在options创建的watch
//    我们$watch创建的watch
//    vm._watchers:Array 存放了所有的watch
// 2、computedWatch
//   vm._computedWatchers:Object 存放了所有的computedWatch
// 3、渲染watch
//    每个组件，都有一个渲染watch
//    vm._watcher 存放了渲染watch

// 从Watcher要处理的事情来看Watcher!!!(理解这个对选项和Watcher的功能会更透彻)
// Watcher。要处理的可以认为两部分
// 1、value（获取value的过程就会依赖收集）
//    value由lazy控制是否立马获取，只能用于computedWatch
// 2、执行cb
//    cb由sync(派发后同步执行cb，不仅调度队列)，immediate（初始化后，立马执行，而非调度触发）控制

// 我们先看下new Watcher()的选项
this.deep = !!options.deep  // 用户Watcher 可以配置
this.user = !!options.user  // 用户Watcher 内部会创建
this.lazy = !!options.lazy  // computedWatch 内部会创建，也只能用于computedWatch。因为computedWatch会额外创建defineReactive属性，访问的时候，执行this.get()。然后依赖收集。其它Watcher没有这个逻辑
this.sync = !!options.sync  // 用户Watcher 可以配置。此时，不会进flushSchedulerQueue。会立马this.run()
this.before = options.before // 这个是在flushSchedulerQueue会判断，如果有则先执行，在执行Watcher.run()。也就是不能和sync/lazy同时存在，因为sync/lazy不会进flushSchedulerQueue。
// 在渲染Watcher会使用
// new Watcher(vm,getter,cb,options,isRenderWatcher)
new Watcher(vm, updateComponent, noop, {
    before () {
        if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate')
        }
    }
}, true /* isRenderWatcher */)
// 当然我们也可以在用户Watcher 中配置。目前来看，不支持异步（如异步执行完before再执行handle，目前不支持，因为befre()是同步执行的）。所以只能打印一些消息什么的。

// 其它选项
immediate // 它是用于用户Watcher。如果配置了。则会执行完new Watcher()后。清空上下文后走。执行cb()。当然作用上不能和lazy同存，因为lazy不会立马计算值，当然实际上，immediate只作用于用户Watcher。lazy只作用于computedWatch

```

### 1、用户watch

```js
// 方式1
options
{
    watch:{ // 这里创建的就是用户watch
        color(){}
    }
}

// 方式2
vm.$watch( expOrFn, callback, [options] )

// 这两者有什么区别？
// 没多大区别，方式1最终也是走$watch函数


// 唯一区别
// 方式2，第一个参数可以支持函数
// 方式1只能是表达式（如这里的'color',或复杂一点的'persion.details'等，会转化为vm[perision][details]。注意不支持[]）

// 我们先看共同点，也就是方式1，也就是只能exp情况下，创建的Watch
// 本小节最后，再来分析下区别的地方。
```

```js
// 我们先看源码

// 入口：src/core/instance/state.js
Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    // 第一步，规范化入参
    const vm: Component = this
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    // 第二步，处理options
    options = options || {}
    options.user = true
    // 第三步，创建Watcher
    const watcher = new Watcher(vm, expOrFn, cb, options)
    // 第四步，处理immediate选项
    if (options.immediate) {
      const info = `callback for immediate watcher "${watcher.expression}"`
      pushTarget()
      invokeWithErrorHandling(cb, vm, [watcher.value], vm, info)
      popTarget()
    }
    // 第五步，返回unwatchFn
    return function unwatchFn () {
      watcher.teardown()
    }
}

// 说明：
// 逻辑还是很清晰的

// 关注点
// 1、此时创建的Watcher的选项options，会标记是用户Watcher，也就是options.user = true
// 2、options的immediate。是不参与Watcher的，也就是Watcher只负责Watcher。不负责派发

// OK，我们进入new Watcher()。再从options角度再来看下源码
```

```js
// 我们先看
// 第四步，处理immediate选项
if (options.immediate) {
    const info = `callback for immediate watcher "${watcher.expression}"`
    // 设置上下文，
    // 这里因为没有给参数，相对于Dep.target = undefined
    // 也就是真实作用，是移除上下文。避免执行过程中，依赖收集
    pushTarget()
    invokeWithErrorHandling(cb, vm, [watcher.value], vm, info)
    // 移除上下文
    popTarget()
}

// 我们再看下Watcher的run()
run () {
    if (this.active) {
        const value = this.get()
        if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
        ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
            const info = `callback for watcher "${this.expression}"`
            invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info)
        } else {
            this.cb.call(this.vm, value, oldValue)
        }
        }
    }
}

// 也就是如果是immediate
// 1、清除上下文后，直接执行cb：new Watcher()时，会收集依赖，这里只是纯碎获取值，所以移除上下文后执行cb。避免再次依赖收集
// 2、相对于正常的派发区别：跳过正常的派发，因为只是立马执行，并没有更新，没必要派发
```

```js
// 入口：src/core/observer/watcher.js

// 源码
export default class Watcher {
  // 用户Watcher传参为：new Watcher(vm, expOrFn, cb, options)
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean // 这里是给渲染Watcher用的，后续我们来介绍
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      // 前面有介绍，渲染Watcher，会在vm._watcher 存储
      vm._watcher = this  
    }
    // 前面有介绍，所有Watcher。会存储在vm._watchers
    vm._watchers.push(this)
    // 处理options
    // 用户Watcher选项，外部提供的选项只有：deep和immediate（immediate不是在这里起作用）
    // 以及内部创建的user。
    // 也就是用户Watcher在这里的选项只有：deep和user
    if (options) {
      this.deep = !!options.deep // 这里取options.deep
      this.user = !!options.user // 用户Watcher，这里是true
      this.lazy = !!options.lazy // 用户Watcher，没有这个选项，为false
      this.sync = !!options.sync // 这里取options.sync。配置了这个会立马执行cb
      this.before = options.before // 用户Watcher，没有这个选项，为false
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // 获取getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    // 走this.get()。也就是前面分析的走依赖收集
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      // user起作用的地方之一 
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // deep其作用的地方
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
  // 其它先略
}

// 总结：
// 用户Watcher。真正参与new Watcher()的选项只有：deep和user

// 1、deep：用户值继续深度遍历进去，收集依赖
// 2、user：用于区分，如果是用户的watcher。则会提示错误信息说明的。如this.get()中
if (this.user) {
    handleError(e, vm, `getter for watcher "${this.expression}"`)
} else {
    throw e
}

// 当然，这些选项，在后续派发的时候，的逻辑也不一样，我们来看下
// 当触发派发后，会执行
subs[i].update()
// 也就是
update () {
    /* istanbul ignore else */
    if (this.lazy) {
        this.dirty = true
    } else if (this.sync) {
        // 用户Watcher，如果配置了sync。则会进这里。会立马执行cb
        this.run()
    } else {
        // 用户Watcher，没有配置sync。会进这里。
        queueWatcher(this)
    }
}
// 后续会执行 watcher.run()
run () {
    if (this.active) {
        const value = this.get()
        if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
        ) {
        // set new value
        const oldValue = this.value
        this.value = value
        // 区别点在这里
        if (this.user) {
            const info = `callback for watcher "${this.expression}"`
            invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info)
        } else {
            this.cb.call(this.vm, value, oldValue)
        }
        }
    }
}

// 总结
// 也就是用户Watcher。是比较普通的一个Watcher。没有太多区别点
// user只是提示信息等方面，有有点不一样而已。
// sync会立马执行cb。而不是进队列
```
```js
// 我们看完方式1，在看方式2
vm.$watch( expOrFn, callback, [options] )

// 我们刚才分析了区别点就是这里的参数1.可以是函数。
// 官网也有介绍：https://cn.vuejs.org/v2/api/#vm-watch

// 我们回到源码，来看区别点
// 我们回到new Watcher()部分代码

// 获取getter
if (typeof expOrFn === 'function') {
    this.getter = expOrFn
} else {
    this.getter = parsePath(expOrFn)
    if (!this.getter) {
    this.getter = noop
    process.env.NODE_ENV !== 'production' && warn(
        `Failed watching path: "${expOrFn}" ` +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
    )
    }
}

// 后续会走this.get()。我们结合get代码来看下
get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
        value = this.getter.call(vm, vm) // 重点关注这里
    } catch (e) {
        // user起作用的地方之一 
        if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
        } else {
        throw e
        }
    } finally {
        // deep其作用的地方
        if (this.deep) {
        traverse(value)
        }
        popTarget()
        this.cleanupDeps()
    }
    return value
}

// 也就是收集依赖。是通过走 this.getter.call(vm, vm)
// 所以，expOrFn可以看成就是getter。
// 如果是字符串，如：'persion.details',会转化成function(){return vm[persion][details]}
// 如果是函数，则直接就是getter
// 所以，该函数，内部访问的所有值，都会依赖收集
// 官网也有介绍

// 函数
vm.$watch(
  function () {
    console.log(this.color); // 包括这里的color。也会依赖收集
    // 表达式 `this.a + this.b` 每次得出一个不同的结果时
    // 处理函数都会被调用。
    // 这就像监听一个未被定义的计算属性
    return this.a + this.b
  },
  function (newVal, oldVal) {
    // 做点什么
  }
)

// 是不是一下子，对expOrFn或方式1和方式2，有更清晰的认识了。

// 除了理解清晰外，我们能做什么

// 有时候，方式1创建的watch。不好兼听复合类型（如要监听多个值，这个时候我们就可以用方式2）
// 从而，不必先走computed。再watch computed的值

// 到这里，我们是不是突然发现computed的秘密了。是不是就是这里的expOrFn中的fun

// OK。我们进入computed
```

### 2、computedWatcher

```js
// 入口：src/core/instance/state.js

// 源码

// computedWatcher的选项是lazy
const computedWatcherOptions = { lazy: true }
function initComputed (vm: Component, computed: Object) {
  // 前面有介绍，computedWatcher会存储在vm._computedWatchers
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()
  for (const key in computed) {
    // 获取getter。相对于用户Watch的getter,或者说expOrFn
    // computed支持{getter}形式
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // 创建一个computedWatcher
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      } else if (vm.$options.methods && key in vm.$options.methods) {
        warn(`The computed property "${key}" is already defined as a method.`, vm)
      }
    }
  }
}

// 先关注
// 1、const computedWatcherOptions = { lazy: true }
// 2、new Watcher(vm,getter || noop,noop,computedWatcherOptions)

//  OK，我们再回顾下上面的总结
// 有时候，方式1创建的watch。不好兼听复合类型（如要监听多个值，这个时候我们就可以用方式2）
// 从而，不必先走computed。再watch computed的值
// 到这里，我们是不是突然发现computed的秘密了。是不是就是这里的expOrFn中的fun

// 我们进入new Watcher()。再从computedWatcher角度再来看下
```
```js
// 入口：src/core/observer/watcher.js

// 源码：
export default class Watcher {
  // new Watcher(vm,getter || noop,noop,computedWatcherOptions)
  // const computedWatcherOptions = { lazy: true }
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    // options
    // 对于computedWatcher，只有一个内部创建的options：{ lazy: true }
    if (options) {
      this.deep = !!options.deep // computedWatcher，这里是false
      this.user = !!options.user // computedWatcher，这里是false
      this.lazy = !!options.lazy // computedWatcher，这里取options.lazy，为true
      this.sync = !!options.sync // computedWatcher，这里是false
      this.before = options.before // computedWatcher，这里是false
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    // 关注下这里，this.dirty是this.lazy的深拷贝。
    // 也就是不能修改原先状态：this.lazy 
    // 修改状态用this.dirty
    this.dirty = this.lazy 
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    // 关注重点：computedWatcher不会立马依赖收集
    this.value = this.lazy
      ? undefined
      : this.get()
  }
  // 其它略
}

// 我们来区别下用户Watcher

// 1、创建情况：没有太大区别
// 2、依赖收集：computedWatcher不会立马依赖收集  this.value = this.lazy ？ undefined : this.get()
// 3、派发情况：我们接下来分析下
// 我们再从走派发角度，来看下有没有什么区别

// 当触发派发后，会执行
subs[i].update()
// 也就是
update () {
    /* istanbul ignore else */
    if (this.lazy) {
        // 也就是computedWatcher不会把当前Watcher。推送到更新列表
        // 只是修改了this.dirty为true。
        this.dirty = true
    } else if (this.sync) {
        this.run()
    } else {
        queueWatcher(this)
    }
}

// 那什么时候会执行cb呢？
// 我们回到initComputed
```
```js
// 入口：src/core/instance/state.js

// 源码：
// computedWatcher的选项是lazy
const computedWatcherOptions = { lazy: true }
function initComputed (vm: Component, computed: Object) {
  // 前面有介绍，computedWatcher会存储在vm._computedWatchers
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()
  for (const key in computed) {
    // 获取getter。相对于用户Watch的getter,或者说expOrFn
    // computed支持{getter}形式
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // 创建一个computedWatcher
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // 重点关注这里
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      } else if (vm.$options.methods && key in vm.$options.methods) {
        warn(`The computed property "${key}" is already defined as a method.`, vm)
      }
    }
  }
}

// defineComputed(vm, key, userDef)
// 精简版
export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    // 重点1:创建getter 
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  }
  // 重点2，给vm增加了一个属性
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
// 
function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      // watcher.dirty = this.lazy
      // 默认是true
      // 源码在下面，执行一次这里后，dirty会置为false。直到它依赖的目标，派发了，又会重置为true
      // 也就是只有读取了这个属性，且有更新，才会重新获取值（及重新获取依赖）
      if (watcher.dirty) {
        watcher.evaluate()
      }
      // 这个时候，才依赖收集。
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}

// Watcher的evaluate方法。
evaluate () {
    this.value = this.get()
    this.dirty = false
}
```

### 3、用户watcher和computedWatcher的区别

```js
// 前面我们有介绍用户watcher和computedWatcher
// 这里我们来做个小结

// 用户watcher
// 1、语法：vm.$watch( expOrFn, cb, [options] ) 和 options写
// 2、实例：new Watcher(vm, expOrFn, cb, options)
// 3、选项：支持外部选项：deep和immediate和sync。内部创建选项user
//    这里其作用的选项是：deep 和 sync 和 user
// 4、收集：创建Watcher后，会进入this.get(),会依赖收集
// 4、派发：会进入queueWatcher(this)。然后走 watcher.run()。
//    获取值(重新收集依赖)和执行cb

// computedWatcher
// 1、语法：只能在options写。computed:{xx(){}}
// 2、实例：new Watcher(vm,getter || noop,noop,computedWatcherOptions)
// 3、选项：没有外部选项，内部创建选项lazy
// 4、收集：不会执行this.get(),也就是不会依赖收集
// 5、派发：只是标记this.dirty = true
// 6、会在vm增加属性
//    如果读取了该属性，且收到过派发，则才会获取值
//    如果是有Watcher上下文，还会让自己收集的依赖，也关注当前Watcher


// 先看下这段代码
vm.$watch(
  function () {
    console.log(this.color); // 包括这里的color。也会依赖收集
    // 表达式 `this.a + this.b` 每次得出一个不同的结果时
    // 处理函数都会被调用。
    // 这就像监听一个未被定义的计算属性
    return this.a + this.b
  },
  function (newVal, oldVal) {
    // 做点什么
  }
)
// 理解下expOrFn
// 用户watcher的expOrFn 等同于 computedWatcher 的函数体

// 一、从Watcher角度：
//    1、都是Watcher
//    2、computedWatcher只是没有cb的Watcher
// 二、从依赖收集角度
//    1、用户watcher会立马收集依赖
//    2、computedWatcher在获取该属性时，才收集依赖。
// 三、从派发角度：
//    1、用户watcher 会进入queueWatcher(this)，然后走 watcher.run()，执行获取值和执行cb
//    2、computedWatcher 只是标记改变了。会额外在vm创建属性，读取该属性的时候且标记改变了，才会获取值。

// 总结下来：lazy 和 属性
// 1、因为computedWatcher 是lazy，所以会延迟获取值，延迟收集依赖
// 2、因为computedWatcher 是属性，所以会增加一个额外的属性，且没有cb

// 如何立马执行
// 1、用户Watcher。配置sync选项，就会立马执行
// 2、computedWatcher。读取该属性，就会立马执行
```
### 4、渲染Watcher

```js
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
  // 给vm添加了$el属性。 
  vm.$el = el
  callHook(vm, 'beforeMount')

  let updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }

  // 创建渲染Watcher
  // new Watcher(vm,getter,cb,options,isRenderWatcher)
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

//  OK。我们进入new Watcher()，从渲染Watcher角度再来看下
```
```js
// 创建渲染Watcher
new Watcher(
    vm,                                  // vm
    ()=>{                                // getter
        vm._update(vm._render(), false)
    }, 
    noop,                                // cb
    {                                    // options
        before () {
            if (vm._isMounted && !vm._isDestroyed) {
                callHook(vm, 'beforeUpdate')
            }
        }
    },
    true                                  // isRenderWatcher
)

// 和用户Watcher。没啥区别
// 要说区别，就是不能外部配置选项。也就是选项是固定的，只有before

// before在什么时候起作用呢？

// 我们知道，非lazy/非sync的Watcher，会进入到queueWatcher。然后进入到flushSchedulerQueue
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow()
  flushing = true
  let watcher, id
  queue.sort((a, b) => a.id - b.id)
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    // 重点关注这里
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    // 然后走this.run()
    watcher.run()
  }
}
```
## 二、测试

```js
// 可以测试下不同选项的作用
// 这里略
```

## 三、总结

```js
// 1、用户watch
//    我们在options创建的watch
//    我们$watch创建的watch
//    vm._watchers:Array 存放了所有的watch
// 2、computedWatch
//   vm._computedWatchers:Object 存放了所有的computedWatch
// 3、渲染watch
//    每个组件，都有一个渲染watch
//    vm._watcher 存放了渲染watch


// 我们先看下new Watcher()的选项
this.deep = !!options.deep  // 用户Watcher 可以配置
this.user = !!options.user  // 用户Watcher 内部会创建
this.lazy = !!options.lazy  // computedWatch 内部会创建，也只能用于computedWatch。因为computedWatch会额外创建defineReactive属性，访问的时候，执行this.get()。然后依赖收集。其它Watcher没有这个逻辑
this.sync = !!options.sync  // 用户Watcher 可以配置。此时，不会进flushSchedulerQueue。会立马this.run()
this.before = options.before // 这个是在flushSchedulerQueue会判断，如果有则先执行，在执行Watcher.run()。也就是不能和sync/lazy同时存在，因为sync/lazy不会进flushSchedulerQueue。
// 在渲染Watcher会使用
// new Watcher(vm,getter,cb,options,isRenderWatcher)
new Watcher(vm, updateComponent, noop, {
    before () {
        if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate')
        }
    }
}, true /* isRenderWatcher */)
// 当然我们也可以在用户Watcher 中配置。目前来看，不支持异步（如异步执行完before再执行handle，目前不支持，因为befre()是同步执行的）。所以只能打印一些消息什么的。

// 其它选项
immediate // 它是用于用户Watcher。如果配置了。则会执行完new Watcher()后。清空上下文后走。执行cb()。当然作用上不能和lazy同存，因为lazy不会立马计算值，当然实际上，immediate只作用于用户Watcher。lazy只作用于computedWatch


// 从Watcher要处理的事情来看Watcher!!!(理解这个对选项和Watcher的功能会更透彻)
// Watcher。要处理的可以认为两部分
// 1、value（获取value的过程就会依赖收集）
//    value由lazy控制是否立马获取，只能用于computedWatch
// 2、执行cb
//    cb由sync(派发后同步执行cb，不仅调度队列)，immediate（初始化后，立马执行，而非调度触发）控制
```