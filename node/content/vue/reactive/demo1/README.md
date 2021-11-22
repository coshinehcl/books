# 响应式原理

## 一、序

### 1、观察者 or 发布订阅
```js
// 观察者模式和发布订阅模式的区别？
// 就看有没有中间人来统一调度(也就是是否直接观察目标)，有中间人调度就是发布订阅模式，如头条新闻。没有则是观察者模式，addEventLister()
// 从另外一个角度来看，也就是订阅者（观察者）的时候，是否需要知道发布者（目标），
// 如果需要知道目标，如addEventLister('load')，观察的目标就是具体的load。则是观察者
// 如果不需要知道目标，也就是订阅笼统目标（调度中心），则为发布订阅模式。如我订阅了军事频道，谁发布的我不在乎（和具体目标解偶）。

// Vue使用的是观察者模式，因为:不管是正常的watch还是渲染watch。都是类似下面的结构
watch:{
    color(){
        // 略
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

// 观察者模式，最重要的两步
// 1、收集对方
//    对方是谁，也就是需要实名id
//    目标收集观察者，这样目标改变后才知道通知谁
//    观察者收集目标，这样就能知道哪个目标改变会通知自己
// 2、目标要知道自己改变了，然后派发通知

// Vue怎么做的呢？
// 1、收集对方
//    对方是谁，也就是需要实名id ———— 观察者和目标，都关联dep。只要收集对方的dep就行了。
//    目标收集观察者，这样目标改变后才知道通知谁
//    观察者收集目标，这样就能知道哪个目标改变会通知自己。及可以通知收集的依赖，增加新的观察者。（见demo2的计算属性）
//    watcher.depend()，会触发收集的依赖，this.deps[i].depend()，然后会走Dep.target.addDep(this)。
//    也就是Watcher收集依赖，可以让这些依赖，增加新的Watcher。
// 2、目标要知道自己改变了，然后派发通知 ————— 对于对象，对属性Object.defineProperty。对于数组，重写方法。

// 目标是谁？
// 狭义目标：所有属性。因为我们业务代码中watch的都是'persion.details'等具体属性
// 广义目标：所有属性和引用类型的值：因为有些值的操作，属性捕获不到，所以还需要把值也列为目标！！！

// Vue具体来说是这样：

// 目标这块：那$data来举例
// 1、把$data值（深度）尝试Observer处理。属性（深度）会defineReactive处理
//    比如：$data:{x:[],y:{name:1,details:{}}}。
//         则$data、[]、{name:1,details:{}}}、{}会Observer处理。
//         x、name、details会defineReactive处理。
//    尝试Observer处理：也就是只有满足observe方法内的条件才会Observer。简单来说就是非冻结且是引用类型
// 2、对属性defineReactive处理好理解，也就是Object.defineProperty，是为了setter/getter后能捕获到
// 3、对值尝试Observer处理干嘛呢？
//    a、深度遍历的需要，也就是每个Observer，都是为了遍历该值本身的属性，然后让其属性defineReactive处理
//    b、真正原因是，有些操作，属性是捕获不到改变的，如delete或[{}]数组中的值改变。这个时候怎么办呢？
//      所以Vue提供了$delete和重写了数组的方法，在里面，会拿到该值的依赖，操作后，也能派发消息出来
//      所以，属性有的Watcher，值也要尝试有。
//    c、或者另外角度来看，值也是目标。所以也需要关联dep
// 4、对象和数组，上面的处理逻辑有些不一样。
//    对于对象，属性会defineReactive处理，值尝试Observer处理
//    对于数组，只要值尝试Observer处理（如果创建了Observer，则还会继续遍历下去。逻辑同上，判断其值类型）
// 5、Observer和defineReactive处理后，都会有一个dep来关联
//    Observer：因为目标是引用类型，直接添加了一个属性'__ob__'来存储当前Observer:{value:'',dep,}。其中包含了dep
//    defineReactive:因为处理的是属性，那怎么存储其dep呢，因为属性本身没办法关联，所以采用闭包来存储
// 6、通过上面的处理
//    a、所有目标（深度属性）都是关联了dep。且getter/setter操作能知道自己改变了，派发消息
//    b、有些对值的操作，该属性捕获不到，那提供了$delete和重写了数组的方法。获取该值的依赖，也能派发消息出去。
//       这里重申下，所以属性收集Watcher,值也要尝试收集该Watcher。

// 观察者这块
// 1、创建观察者：参数为目标，配置
// 2、观察者获取目标的值，触发了值的getter。开始收集

// dep是什么？dep就是目标的一个替身！！！（这个理解很重要）
// 因为像key,value怎么来表示自己呢？
// 这边做法是，new Dep()一个实例来和自己关联。每个dep实例的id是自增的，也就能保证关联的dep和自己是一一对应的。
// dep结构
{
    id: number; // 唯一标识，目标会和其dep关联起来
    subs: Array<Watcher>; // 目标收集的Watcher
}
```

```js
// 总结：
// 1、$data所有属性（深度），会defineReactive处理，也就是Object.defineProperty。并且关联一个dep
// 2、有些操作，属性捕获不到。所以还需要对值尝试Observer处理。并且关联一个dep。
//    并且属性（目标）收集的Watcher。值也尝试收集，才好派发
// 3、目标是谁？
//    狭义目标：所有属性。因为我们业务代码中watch的都是'persion.details'等具体属性
//    广义目标：所有属性和引用类型的值：因为有些值的操作，属性捕获不到，所以还需要把值也列为目标！！！
// 4、属性的dep通过闭包来存储。值如果可以Observer，则会添加一个属性'__ob__'来存储当前Observer。其中也包含了dep
// 5、收集是相互的，Watcher会收集依赖。依赖也会收集Watcher。
// 6、Observer和defineReactive
//    前面我们有介绍，为什么有了defineReactive,还需要Observer
//    最简洁的总结就是：
//    a、defineReactive是为对象类型服务的
//    b、Observer是为了遍历需要和数组服务的（存储依赖，数组某些方法执行时，获取到该值的依赖，然后派发）

// 我们来看下vm的$data,观察__ob__
color: (...)
list: Array(2)
    0: 1
    1: {__ob__: Observer}
    length: 2
    __ob__: Observer {value: Array(2), dep: Dep, vmCount: 0}
persion: (...)
persion1: (...)
__ob__: Observer {value: {…}, dep: Dep, vmCount: 1}
// 我们平常开发的时候，输出this/vm
// 从中可以观察到该值，收集了哪些Watcher(被哪些Watcher依赖)


// 其它：
// 1、 vm._watchers.push(this)：也就是所有的Watcher。会添加到当前实例的_watchers上。
// 2、vm._watcher：存储的是渲染Watcher。
// 我们来看下vm
vm:{
_watcher: Watcher {vm: Vue, deep: false, user: false, lazy: false, sync: false, …}
_watchers: Array(6)
    0: Watcher {vm: Vue, deep: false, user: true, lazy: false, sync: false, …}
    1: Watcher {vm: Vue, deep: true, user: true, lazy: false, sync: false, …}
    2: Watcher {vm: Vue, deep: false, user: true, lazy: false, sync: false, …}
    3: Watcher {vm: Vue, deep: false, user: true, lazy: false, sync: false, …}
    4: Watcher {vm: Vue, deep: true, user: true, lazy: false, sync: false, …}
    5: Watcher {vm: Vue, deep: false, user: false, lazy: false, sync: false, …}
    length: 6
}
// 我们平常开发的时候，输出this/vm
// 从中可以观察到该Watcher，收集了依赖。
// 如果该依赖是Observer，则我们通过$data点进去看'__ob__'。也能知道具体是哪个值
// 如果该依赖是defineReactive，因为defineReactive的dep是闭包来存储的
// 对于这个情况，我们不好查看，但其实也能看出来，通过阅读以下内容，就知道了。
// 当然，我们从我们敲的代码，也能知道。

// OK，下面我们仔细展开来细说
```

### 2、本文能收获什么

```js
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

// 更详细的知识，查看demo2。能收获更多响应式知识。


// 下面主要是三大块，目标实名和目标可感知修改、收集依赖、派发

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


// 掌握这个概念，对于我们理解，什么时候增加响应，什么时候派发，什么时候收集依赖，会有帮助。不至于太乱。
```

## 二、目标实名和目标可感知修改

### 1、描述
```js
// 目标是谁？
// 狭义目标：所有属性。因为我们业务代码中watch的都是'persion.details'等具体属性
// 广义目标：所有属性和引用类型的值：因为有些值的操作，属性捕获不到，所以还需要把值也列为目标！！！

// 因为我们研究源码，目标不加以说明，指的就是广义目标

// 1、目标实名
//    属性，关联dep。值尝试Observer，然后关联dep

// 2、目标可感知修改
//    属性defineReactive处理。
//    值：提供了$delete及重写了数组的方法

// 3、能构收集依赖：收集过程我们叫收集依赖。注意收集是相互的（Watcher收集目标，目标收集Watcher）
//    在哪里收集呢？在getter
// 如
// options
{
    watcher:{
        'persion.detail'(newV){
            console.log(newV)
        }
    }
}
// 内部，会转换为vm['persion']['detail']
// 也就是
// 会触发vm['persion']的getter
// 会触发vm['persion']['detail']的getter

// 4、当修改时，能捕获到，并派发
//   有些操作，属性是捕获不到的。如delete或数组的操作。
//   如果是属性的setter。则，触发settr，并派发属性dep收集的Watcher
//   如果是delete或数组的操作，则因为Vue提供了$delete及重写了数组的方法。则派发值的dep收集的Watcher

// ok，我们从源码角度，从$data角度，一步步来剖析

// 思考？
// Observer和defineReactive
// 前面我们有介绍，为什么有了defineReactive,还需要Observer
//    最简洁的总结就是：
//    a、defineReactive是为对象类型服务的
//    b、Observer是为了遍历需要和数组服务的（存储依赖，数组某些方法执行时，获取到该值的依赖，然后派发）
```

### 1、入口
```js
// 我们从这里开始

// 入口：src/core/instance/state.js
function initData (vm: Component) {
    // 略
    observe(data, true /* asRootData */)
}
```

### 2、observe()

控制是否能创建Observer，也就是尝试对值Observer处理。

```js
// 入口：src/core/observer/index.js

// 源码
export function observe (value: any, asRootData: ?boolean): Observer | void {
  // 判断能否Observer
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // 避免重复Observer。比如后续赋值的时候，赋值的已经Observer的值
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    // 标识是否是root $data
    // 避免一些操作，对root $data执行，如delete，set
    ob.vmCount++
  }
  return ob
}

// 也就是符合条件的才会new Observer(value)
// 1、控制变量shouldObserve
// 2、非服务器渲染
// 3、对象或者数组
// 4、可拓展
// 5、非vue

export function toggleObserving (value: boolean) {
  shouldObserve = value
}
```

### 3、new Observer()

也就是值满足创建Observer条件，创建一个Observer

```js
// 入口：src/core/observer/index.js

// 部分源码（精简版）
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    // 会通过'__ob__'关联this，及dep
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // 重写我们Observer的数组，的部分方法。
      // 而不是直接原型上暴力修改，这里点个赞
      // 这里后面会细说
      protoAugment(value, arrayMethods)
      // 如果是数组，则对其下值，走observe，也就是值尝试Observer
      this.observeArray(value)
    } else {
      // 如果是对象，则对其属性defineReactive处理，也就是Object.defineProperty
      this.walk(value)
    }
  }
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

// 总结：
// 1、深度遍历
// 2、如果值是对象
//    属性defineReactive处理
//    值走observe，尝试Observer
// 3、如果值是数组
//    值走observe，尝试Observer
// 4、至到完全遍历完

// 至此，所有满足条件的值
// 完成了深度遍历
// 及增加了一个属性，来关联dep： def(value, '__ob__', this)

// 接下来，我们来分析下，对于属性，defineReactive处理，做了什么
```

### 4、defineReactive()
```js
// 入口：src/core/observer/index.js

// 部分源码
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  // 是否可配置
  if (property && property.configurable === false) {
    return
  }
  // 获取原先定义的getter和setter。
  // 因为为了响应式，只要是可配置的，都会给其加上getter和setter。
  // 如，如果原先定义的时候，有getter，没有setter，说明只读。则不应该走赋值。且不能派发
  // 如，如果原先定义的时候，有getter，则直接走默认的getter获取值
  //    否则我们走obj[key]，这个时候，走的是直接读取，或走我们这个时候定义的新的getter
  // 如，如果如果原先定义的时候，有setter，则直接走默认的setter设置值
  //    否则我们走 val = newVal，其实走的是我们这个时候定义的新的setter。
  // 细节满满啊，点赞。
  // 关于这块，只要知道（下面具体代码关于这块就不细说了）
  // 1、因为为了响应式，只要是可配置的，都会给其加上getter和setter
  // 2、会通过判断原先定义的getter/setter。走不同的逻辑。
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
  // 这里，尝试把value转换为Observer 
  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      // 上下文
      // Watcher的时候会创建当前Watcher上下文
      // 此时 Dep.target 值为 当前Watcher。（后续Watcher部分会说到）
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          // 如果值是Observer，则值也会收集依赖
          childOb.dep.depend()
          // 如果值是数组，则会把该数组下所有Observer（也就是值是引用类型的）（深度遍历），也会触发收集
          // 因为数组操作，观察不到setter
          // 对数组的某些操作，会触发重写了数组的方法。进而判断值的'__ob__'，然后获取到收集的依赖，是可以派发list的响应的
          // 比如。页面，渲染list。list中，修改中间层数组的某个item。走重写了数组的方法。
          // 则会触发该该item的父亲数组，因为走了这里的逻辑，该父亲数组，也收集了渲染Watcher。所以能够派发给渲染Watch
          // 细啊，点个赞，也就尽可能的能够响应。
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      // 避免重复赋值，或者赋NaN
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
      // 对新值，生成新的Observer（深度遍历，和走$data逻辑一样）
      childOb = !shallow && observe(newVal)
      // 派发更新   
      dep.notify()
    }
  })
}

// 从这里，我们看到了defineReactive的dep是靠闭包来存储的
```

### 5、提供了$delete及重写了数组的方法

```js
// 重写了数组的方法
// 从前面我们可知，对于数组的操作，前面是无能为力的。那怎么派发呢？

// 1、回到new Observer()源码部分，我们看到
protoAugment(value, arrayMethods)

// 2、arrayMethods
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    // 走原来的方法，获取到结果
    const result = original.apply(this, args)
    // 获取到值的Observer。后续会拿到dep。进行派发：ob.dep.notify()
    const ob = this.__ob__
    // 拿到新插入的部分
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 如果有新插入的部分，新的那部分，Observe处理,进而会更新依赖关系
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})


// 3、protoAugment
function protoAugment (target, src: Object) {
  // 也就是让数组，获取到的一些方法是来自src的，也就是arrayMethods
  target.__proto__ = src
}

// 总结：很好理解
// 1、重写的是会变更数组的方法（变更方法），对于非变更方法，如filter,concat,采用整体重新赋值，注意不能局部赋值，是检测不到的。
//    这部分，官网也有介绍：https://cn.vuejs.org/v2/guide/list.html#%E6%95%B0%E7%BB%84%E6%9B%B4%E6%96%B0%E6%A3%80%E6%B5%8B  
// 2、对我们Observer部分的数组重写方法，不影响其它数组。赞
// 3、新方法逻辑为
//    走旧方法，执行结果
//    如果有新的插入，对新值部分，Observe处理
//    拿到当前操作对象：也就是当前操作数组，拿到其收集的依赖。派发更新。
```

```js
// $delete
// 从前面我们可知，对于delete 操作，前面是无能为力的。那怎么派发呢？

// 从前面Vue的构造器章节，我们知道其定义在：src/core/instance/state.js
Vue.prototype.$delete = del;

// del取的是：src/core/observer/index.js
export function del (target: Array<any> | Object, key: any) {
  // 判断参数合法性 
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
  };
  // 如果是数组，走数组的移除
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  // 如果是对象，获取对象的Observer
  const ob = (target: any).__ob__;
  // 不能移除Vue或root $data
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  // 如果没有这个key，不操作
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  // 派发出去
  if (!ob) {
    return
  }
  ob.dep.notify()
}
```

```js
// 思考一个问题？什么时候会更新依赖呢？

// 我们知道，创建Watcher的时候，会收集相关的依赖。

// 如果我们的目标改变值了或delete了。能够根据前面收集的依赖，派发更新

// 如果我们新的值，改变了。怎么派发呢？
// 原理也很简单，改变后，派发是不会触发依赖收集的。
// 但当这些Watcher更新的时候，就会获取新的值，此时，会重新收集依赖。
// 下次这些新的值，改变后，会走新的依赖派发。
```

### 6、提供了$set

```js
// 从前面Vue的构造器章节，我们知道其定义在：src/core/instance/state.js
Vue.prototype.$set = set;

// set取的是：src/core/observer/index.js
export function set (target: Array<any> | Object, key: any, val: any): any {
  // 合法性判断
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  if (!ob) {
    target[key] = val
    return val
  }
  // 更新响应
  defineReactive(ob.value, key, val)
  // 派发，及收集新的依赖。
  ob.dep.notify()
  return val
}
```

### 5、测试
```html
<!-- 测试代码 -->

<script type="module">
    import Vue from './vue.esm.browser.js';
    const vm = new Vue({
        name:"hcl",
        data(){
            return {
                color:'red', // 测试value是基本类型
                list:[1,{x:2}], // 测试value是引用类型
                persion:{ // 测试多层的引用类型
                    name:'hcl',
                    details:{
                        age:20,
                        job:'web'
                    }
                }
            }
        }
    })
    // 测试方式
    // 我们在Observer() 和 defineReactive() 打印一些log出来

    // 格式为：console.log('当前在哪里',当前操作,关联的dep)
    
    // console.log('Observer',value,this.dep)
    // console.log('defineReactive',key,dep)
</script>
```
```js
// 输出

Observer {color: 'red', list: Array(2), persion: {…}} Dep {id: 2, subs: Array(0)}
defineReactive color Dep {id: 3, subs: Array(0)}
defineReactive list Dep {id: 4, subs: Array(0)}
Observer (2) [1, {…}] Dep {id: 5, subs: Array(0)}
Observer {x: 2} Dep {id: 6, subs: Array(0)}
defineReactive x Dep {id: 7, subs: Array(0)}
defineReactive persion Dep {id: 8, subs: Array(0)}
Observer {name: 'hcl', details: {…}} Dep {id: 9, subs: Array(0)}
defineReactive name Dep {id: 10, subs: Array(0)}
defineReactive details Dep {id: 11, subs: Array(0)}
Observer {age: 20, job: 'web'} Dep {id: 12, subs: Array(0)}
defineReactive age Dep {id: 13, subs: Array(0)}
defineReactive job Dep {id: 14, subs: Array(0)}


// 分析，我们根据代码逻辑，看分析下
// 1、observe(data, true /* asRootData */)
// 2、$data转换为Observer                    // 输出 Observer Object Dep
// 3、遍历$data的key
// 4、遍历到color，把key转换为defineReactive  // 输出 defineReactive color Dep  
// 5、尝试把value转换为Observer。失败
// 6、遍历到list，把key转换为defineReactive   // 输出 defineReactive list Dep
// 7、尝试把value转换为Observer              // 输出 Observer Array(2) Dep
// 8、遍历list值的Observer
// 9、遍历其引用类型的值，把值转换为Observer    // 输出 Observer Object Dep
// 10、遍历{x:2}的key
// 11、遍历到x                              // 输出 defineReactive x Dep
// 12、完成{x:2}的遍历
// 13、完成list值的遍历
// 14、遍历到persion                        // 输出 defineReactive persion Dep
// 15、尝试把value转换为Observer             // 输出 Observer Object Dep
// 17、遍历persion值的Observer
// 18、遍历name                             // 输出 defineReactive name Dep
// 19、尝试把value转换为Observer。失败
// 20、遍历到details                        // 输出 defineReactive details Dep
// 21、尝试把value转换为Observer             // 输出 Observer Object Dep
// 22、遍历persion.details的Observer
// 21、遍历到age                            // 输出 defineReactive age Dep
// 22、尝试把value转换为Observer。失败
// 23、遍历到job                            // 输出 defineReactive job Dep
// 24、尝试把value转换为Observer。失败

```
```js
// 总结：
// 通过测试，我们知道了

// 1、
// $data的所有引用类型(深度)，会尝试转换为Observer
// $data的所有key(深度),会转换为defineReactive

// 2、
// 不管是Observer还是defineReactive。都会有唯一的一个dep和其一一对应（替身）
// Watcher收集的是dep。
```

### 5、总结

``` js
// 上面做的，其实就是一件事
// 一、我们对值的操作，是可捕获的。及关联dep！！！！

// 1、初始化时，会对$data的所有引用Observer处理，对属性defineReactive处理
// 2、当我们修改值或插入了新的值，对新的值也同样处理。
// 这个时候是不会触发依赖收集的！

// 下面要分析的就是依赖收集是怎么做的

// 二、依赖收集
//    依赖收集，在我们获取值的时候,具体来说:
//    1、创建Watcher的时候，如果非lazy。则会进入this.get()，进而根据Watcher上下文,获取值时，收集依赖。
//    2、派发触发后，后续会触发Watcher.run()，进而触发Watcher的this.get()，进而根据Watcher上下文,获取值时，重新收集依赖。

// 三、派发
//    1、对象触发setter时，根据旧依赖，触发派发
//    2、$set、$delete、或数组重写的方法，根据旧依赖，触发派发
//    3、派发触发后，后续会触发Watcher.run()，进而触发Watcher的this.get()，进而根据Watcher上下文,获取值时，重新收集依赖。
```

## 三、Watcher

前面我们介绍完Observer和dep。现在我们进入Watcher

### 1、测试方式

```js
// Watcher有多种，如普通Watcher、渲染Watcher
// 我们这边用一个普通Watcher,关于更多内容看demo2

// options
{
    watch:{
        persion:{
            handler(newV){
                console.log(newV)
            },
            deep:true
        }
    }
}
```

### 2、普通Watcher入口

```js
// 入口：src/core/instance/state.js

// 源码
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

// createWatcher(vm, key, handler)
function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

// 我们再进入vm.$watch(expOrFn, handler, options)

// 我们从前面的Vue构造器，可知$watch，是在stateMixin的时候给原型添加进来的
// 入口：src/core/instance/state.js
// 源码
Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
): Function {
    const vm: Component = this
    if (isPlainObject(cb)) {
        return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
        const info = `callback for immediate watcher "${watcher.expression}"`
        pushTarget()
        invokeWithErrorHandling(cb, vm, [watcher.value], vm, info)
        popTarget()
    }
    return function unwatchFn () {
        watcher.teardown()
    }
}
// 我们重点来关注 const watcher = new Watcher(vm, expOrFn, cb, options)
```

### 3、new Watcher()

```js
// 入口：src/core/observer/watcher.js

// 源码（精简版）
export default class Watcher {
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    // vm._watchers会存储所有的Watcher
    vm._watchers.push(this)

    // 处理options
    // 略

    // 获取值
    this.value = this.lazy
      ? undefined
      : this.get()
  }
  // 获取值，并且从中收集依赖
  get () {
    // 在开始收集前，把修改上下文
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
        // 略
    } finally {
      // 如果是deep，则会遍历其下的所有key的值（深度）
      // 进而收集其下的所有依赖
      if (this.deep) {
        traverse(value)
      }
      // 移除上下文
      popTarget()
      // 更新依赖关系
      this.cleanupDeps()
    }
    return value
  }
  // 其它略，分析到了再展示
}

// 也就是创建一个Watcher
```

## 四、分析依赖收集过程

```js
// 前面我们分析了初始化的时候，引用会Observer，属性会defineReactive
// 依赖收集，在我们获取值的时候
// 具体来说，
// 1、创建Watcher的时候，如果非lazy。则会立马获取值，此时进入getter。获取依赖
// 2、派发更新时，会触发Watcher重新获取值，此时会重新收集依赖。
```
### 1、过程

```js
// 从前面new Watcher()。我们得知

// 1、走this.get()
```
```js
// 2、进入get()方法
get () {
    // 在开始收集前，修改上下文
    pushTarget(this)
    let value
    const vm = this.vm
    try {
        value = this.getter.call(vm, vm)
    } catch (e) {
        // 略
    } finally {
        // 如果是deep，则会遍历其下的所有key的值（深度）
        // 进而收集其下的所有依赖
        if (this.deep) {
            traverse(value)
        }
        // 移除上下文
        popTarget()
        // 更新依赖关系
        this.cleanupDeps()
    }
    return value
    }
    // 其它略，分析到了再展示
}
// pushTarget方法（src/core/observer/dep.js）
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

// 3、尝试获取值 value = this.getter.call(vm, vm)

// 4、触发了defineReactive的getter
```
```js
// 5、进入get
get: function reactiveGetter () {
    const value = getter ? getter.call(obj) : val
    // 从上文可知，这里的Dep.target就是当前Watcher
    if (Dep.target) {
        dep.depend()
        if (childOb) {
            childOb.dep.depend()
            if (Array.isArray(value)) {
            dependArray(value)
            }
        }
    }
    return value
},

// 6、走dep.depend()方法
depend () {
    if (Dep.target) {
        Dep.target.addDep(this)
    }
}
// 也就是往当前Watcher。收集当前dep

// 7、Watcher的addDep方法
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
// Watcher。会用两组列表来存储之前的依赖和新的依赖？
// 因为依赖关系是相互存储的，不然就需要收集新依赖前，Watcher清除所有的dep。对应dep也清除当前Watcher。
// 显然，用两个数组，对比差异会好很多。
// 这块逻辑为：
// 如果有新的依赖，添加到新的依赖中。
// 如果老的依赖中没有这个依赖，也添加进来，并且让这个依赖添加当前Watcher:dep.addSub(this)
// 从而实现了。Watcher和dep都相互收集依赖！！！（理解这个很重要）

// 8、再回到第5步的
if (childOb) {
    childOb.dep.depend()
    if (Array.isArray(value)) {
    dependArray(value)
    }
}
// 也就是如果值是引用类型，则把值的依赖也收集进来

// 9、回到第2步
if (this.deep) {
    traverse(value)
}
// 如果的deep。则遍历其下的所有key(深度)，把其下的所有依赖收集

// 10、回到第2步
// 移除上下文
popTarget()
// 更新依赖关系
this.cleanupDeps()
// 我们这里重点来分析下cleanupDeps()方法
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
// 理解：也就newDeps是收集到的新的依赖。
// 遍历老的依赖，如果新依赖中没有的，则让其依赖移除自身：dep.removeSub(this)
// 然后，新依赖赋值给老依赖。新依赖置空，为下次使用。

// 到此，我们完成了依赖的收集
```
### 2、测试
```js
// 测试方式，创建几个Watcher
// options
const vm = new Vue({
    name:"hcl",
    data(){
        return {
            color:'red', // 测试value是基本类型
            list:[1,{x:2}], // 测试value是引用类型
            persion:{ // 测试多层的引用类型
                name:'hcl',
                details:{
                    age:20,
                    job:'web'
                }
            },
            // 测试deep
            persion1:{
                name1:'hcl1',
                details1:{
                    age1:10,
                    job1:'web1'
                }
            }
        }
    },
    // 这部分用于测试Watcher
    watch:{
        persion:{
            handler(newV){
                console.log(newV)
            },
        },
        persion1:{
            handler(newV){
                console.log(newV)
            },
            deep:true
        },
        // 测试一个目标多个Watcher
        'persion1.name1'(newV){
            console.log(newV)
        },
        color(newV){
            console.log('cb',newV)
        },
        list:{
            handler(newV){
                console.log('cb',newV)
            },
            deep:true
        }
    }
})
```
```js
// 结合前面测试Observer和defineReactive的log
// console.log('Observer',value,this.dep)
// console.log('defineReactive',key,dep)

// 然后我们在Watcher源码部分， console.log('Watcher',expOrFn,this.id,this.deps)
// 主要观察，dep收集了哪些，及查看，对应目标，又收集了哪些Watcher

defineReactive $attrs Dep {id: 0, subs: Array(0)}
defineReactive $listeners Dep {id: 1, subs: Array(0)}

// 从$data开始，为方便查看，我把输出的内容，转换为方便我们查看的内容
// Observer {color: 'red', list: Array(2), persion: {…}, persion1: {…}} Dep {id: 2, subs: Array(0)}
'Observer' + '$data的value' = {id: 2,subs: []}
// defineReactive color Dep {id: 3, subs: Array(0)}
'defineReactive' + 'color' = {id: 3, subs: []}
// defineReactive list Dep {id: 4, subs: Array(0)}
'defineReactive' + 'list' = {id: 4, subs: []}
// Observer (2) [1, {…}] Dep {id: 5, subs: Array(0)}
'Observer' + `${$data.list}` = {id: 5,subs: []}
// Observer {x: 2} Dep {id: 6, subs: Array(0)}
'Observer' + `${$data.list[1]}` = {id: 6,subs: []}
// defineReactive x Dep {id: 7, subs: Array(0)}
'defineReactive' + 'x' = {id: 7, subs: []}
// defineReactive persion Dep {id: 8, subs: Array(0)}
'defineReactive' + 'persion' = {id: 8, subs: []}
// Observer {name: 'hcl', details: {…}} Dep {id: 9, subs: Array(0)}
'Observer' + `${$data.persion}` = {id: 9,subs: []}
// defineReactive name Dep {id: 10, subs: Array(0)}
'defineReactive' + 'name' = {id: 10, subs: []}
// defineReactive details Dep {id: 11, subs: Array(0)}
'defineReactive' + 'details' = {id: 11, subs: []}
// Observer {age: 20, job: 'web'} Dep {id: 12, subs: Array(0)}
'Observer' + `${$data.persion.details}` = {id: 12,subs: []}
// defineReactive age Dep {id: 13, subs: Array(0)}
'defineReactive' + 'age' = {id: 13, subs: []}
// defineReactive job Dep {id: 14, subs: Array(0)}
'defineReactive' + 'job' = {id: 14, subs: []}
// defineReactive persion1 Dep {id: 15, subs: Array(0)}
'defineReactive' + 'persion1' = {id: 15, subs: []}
// Observer {name1: 'hcl1', details1: {…}} Dep {id: 16, subs: Array(0)}
'Observer' + `${$data.persion1}` = {id: 16,subs: []}
// defineReactive name1 Dep {id: 17, subs: Array(0)}
'defineReactive' + 'name1' = {id: 17, subs: []}
// defineReactive details1 Dep {id: 18, subs: Array(0)}
'defineReactive' + 'details1' = {id: 18, subs: []}
// Observer {age1: 10, job1: 'web1'} Dep {id: 19, subs: Array(0)}
'Observer' + `${$data.persion1.details1}` = {id: 19,subs: []}
// defineReactive age1 Dep {id: 20, subs: Array(0)}
'defineReactive' + 'age1' = {id: 20, subs: []}
// defineReactive job1 Dep {id: 21, subs: Array(0)}
'defineReactive' + 'job1' = {id: 21, subs: []}
// 这部分知识，应该在我们掌握【目标和目标的dep相关联】应该就很熟悉了。
// 也就是深度遍历，把引用转换为Observer.把所有key转换为defineReactive。并且和唯一的dep一一对应。

// 上面因为是在对目标和目标的dep关联，还没有收集呢，所以我们看到目标的dep的subs都是[]

// 接下来，我们进入Watcher部分
// console.log('Watcher',expOrFn,this.id,this.deps)
Watcher persion 1 (2) [Dep, Dep]
Watcher persion1 2 (7) [Dep, Dep, Dep, Dep, Dep, Dep, Dep]
Watcher persion1.name1 3 (3) [Dep, Dep, Dep]
Watcher color 4 [Dep]
Watcher list 5 (4) [Dep, Dep, Dep, Dep]
Watcher () => {
      vm._update(vm._render(), hydrating);
    } 6 [Dep]
// 我们发现，创建了6个Watcher。其中一个是渲染Watcher
// 也收集了不少依赖
// 为了更好的观察，我把this.deps部分一个个展开来细说

// 1、Watcher persion 1 (2) [Dep, Dep]
[
    {
        id: 8, // 'defineReactive' + 'persion' = {id: 8, subs: []}
        subs:[ // Watcher
            {id: 1,/*其它Watcher属性略*/}
        ]
    },
    {
        id: 9, // 'Observer' + `${$data.persion}` = {id: 9,subs: []}
        subs:[
            {id: 1,/*其它Watcher属性略*/}
        ]
    }
]
// 也就是Watcher persion。收集了 2个依赖。
// 也就是目标persion的dep（8），及值的dep（9）
// 这些依赖，也收集了自己：{id:1}

// 2、Watcher persion1 2 (7) [Dep, Dep, Dep, Dep, Dep, Dep, Dep]
[
    {
        id: 15, // 'defineReactive' + 'persion1' = {id: 15, subs: []}
        subs:[
            {id: 2,/*其它Watcher属性略*/}
            {id: 3,/*其它Watcher属性略*/}
        ]
    },
    {
        id: 16, // 'Observer' + `${$data.persion1}` = {id: 16,subs: []}
        subs:[
            {id: 2,/*其它Watcher属性略*/}
            {id: 3,/*其它Watcher属性略*/}
        ]
    },
        {
        id: 18, // 'defineReactive' + 'details1' = {id: 18, subs: []}
        subs:[
            {id: 2,/*其它Watcher属性略*/}
        ]
    },
    {
        id: 19, // 'Observer' + `${$data.persion1.details1}` = {id: 19,subs: []}
        subs:[
            {id: 2,/*其它Watcher属性略*/}
        ]
    },
        {
        id: 21, // 'defineReactive' + 'job1' = {id: 21, subs: []}
        subs:[
            {id: 2,/*其它Watcher属性略*/}
        ]
    },
    {
        id: 20, // 'defineReactive' + 'age1' = {id: 20, subs: []}
        subs:[
            {id: 2,/*其它Watcher属性略*/}
        ]
    },
    {
        id: 17, // 'defineReactive' + 'name1' = {id: 17, subs: []}
        subs:[
            {id: 2,/*其它Watcher属性略*/}
            {id: 3,/*其它Watcher属性略*/}
        ]
    }
]
// 也就是Watcher persion1。收集了 7个依赖。
// 先添加目标persion1的dep（15），及值的dep（16）
// 因为是deep
// 所以会进入 traverse(value)，也就是深度遍历值的key
// {name1:'hcl1',details1:{age1:10,job1:'web1'}
// 这里源码会Object.keys()的后面开始遍历
// 先遍历到details1，所以添加依赖目标detials1的dep（18），及值的dep（19）
// 再深度遍历details1的值
// 遍历到job1，所以添加依赖目标detials1.job1的dep（21）
// 遍历到age1，所以添加依赖目标detials1.age1的dep（20）
// 再回来遍历到name1，所以添加依赖目标name1的dep（17）
// 完成遍历
// 我们再来看当前Watcher的dep收集了哪些Watcher
// 1、这些dep也收集了当前Watcher。
// 2、有些还收集了{id:3}，也就是Watcher persion1.name1 3 (3) [Dep, Dep, Dep]
//    我们来分析下
//    persion1.name1表达式，在this.getter.call(vm, vm)时，会vm[persion1][name1]
//    也就是，触发了persion1的getter：
//          此时，Watcher3 收集了目标'persion1'的dep（15）,及值的dep（16）
//          这些依赖，也会收集当前Watcher。所以dep15和dep16也会收集Watcher3
//    也就是，触发了name1的getter:
//           此时，Watcher3 收集了目标'name1'的dep（17）
//           这些依赖，也会收集当前Watcher。所以dep17收集了Watcher3

// 3、Watcher persion1.name1 3 (3) [Dep, Dep, Dep]
[
    {
        id: 15, // 'defineReactive' + 'persion1' = {id: 15, subs: []}
        subs:[
            {id: 2,/*其它Watcher属性略*/}
            {id: 3,/*其它Watcher属性略*/}
        ]
    },
    {
        id: 16, // 'Observer' + `${$data.persion1}` = {id: 16,subs: []}
        subs:[
            {id: 2,/*其它Watcher属性略*/}
            {id: 3,/*其它Watcher属性略*/}
        ]
    },
    {
        id: 17, // 'defineReactive' + 'name1' = {id: 17, subs: []}
        subs:[
            {id: 2,/*其它Watcher属性略*/}
            {id: 3,/*其它Watcher属性略*/}
        ]
    }
]
// 也就是Watcher。收集了 3个依赖
// 前段我们有分析，这里再描述下
// 在this.getter.call(vm, vm)时，会vm[persion1][name1]
// 触发了persion1的dep（15）收集，和值的dep（16）的收集。
// 触发了name1的dep(17)
// 我们再来看当前Watcher的dep收集了哪些Watcher
// 很漂亮，都收集了当前Watcher{id: 3}。 {id: 2,/*其它Watcher属性略*/}是其它Watcher收集的时候，同步收集的。

// 4、Watcher color 4 [Dep]
[
    {
        id: 3, // 'defineReactive' + 'color' = {id: 3, subs: []}
        subs:[
            {id: 4,/*其它Watcher属性略*/}
            {id: 6,/*其它Watcher属性略*/}
        ]
    }
]
// 也就是Watcher。收集了 1个依赖
// 也就是目标persion的dep（3）
// 这些依赖，也收集了自己：{id:4}
// 至于依赖，还收集了Watcher {id: 6} ，肯定是Watcher {id:6} 收集了该依赖。后面会说到

// 5、Watcher list 5 (4) [Dep, Dep, Dep, Dep]
[
    {
        id: 4, // 'defineReactive' + 'list' = {id: 4, subs: []}
        subs:[
            {id: 5,/*其它Watcher属性略*/}
        ]
    },
    {
        id: 5, // 'Observer' + `${$data.list}` = {id: 5,subs: []}
        subs:[
            {id: 5,/*其它Watcher属性略*/}
        ]
    },
    {
        id: 6, // 'Observer' + `${$data.list[1]}` = {id: 6,subs: []}
        subs:[
            {id: 5,/*其它Watcher属性略*/}
        ]
    },
    {
        id: 7, // 'defineReactive' + 'x' = {id: 7, subs: []}
        subs:[
            {id: 5,/*其它Watcher属性略*/}
        ]
    }    
]
// 也就是Watcher。收集了 4个依赖
// 先添加目标list的dep（4），及值的dep（5）,如果值是数组，深度遍历，添加Observer类型的依赖。所以添加了dep(6)
// 因为是deep
// 所以会进入 traverse(value)，也就是深度遍历值的值（注意，如果是数组，遍历的是值，而不是key）
// [1,{x:2}]
// 遍历到1，非引用类型，跳过
// 遍历到{x:2}，注意，[]取值，因为没有getter，所以此时不会添加依赖
// 再遍历{x:2}的key
// 添加目标x的dep（7)


```

## 五、派发

### 1、触发条件
```js
// 触发set时，会触发notify。
// 让其观察者触发更新

set: function reactiveSetter (newVal) {
    // 获取新值，判断是否重新赋值
    const value = getter ? getter.call(obj) : val
    /* eslint-disable no-self-compare */
    if (newVal === value || (newVal !== newVal && value !== value)) {
        return
    }
    /* eslint-enable no-self-compare */
    if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
    }
    
    // 赋值
    if (getter && !setter) return
    if (setter) {
        setter.call(obj, newVal)
    } else {
        val = newVal
    }
    // 尝试生成新值的observe
    childOb = !shallow && observe(newVal)

    // 我们重点关注这一步
    dep.notify()
}
```

### 2、notify()逻辑

```js
// 入口：src/core/observer/dep.js

// 源码
notify () {
    // 拷贝一份列表出来，subs收集的是Watcher列表
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
        // 触发Watcher的upadte()
        subs[i].update()
    }
}
```

### 3、update()

```js
// 入口：src/core/observer/watcher.js

update () {
    /* istanbul ignore else */
    if (this.lazy) {
        this.dirty = true
    } else if (this.sync) {
        this.run()
    } else {
        queueWatcher(this)
    }
}
// 也就是不是立马执行，放到队列中？
// 避免了短时间内，相同Watcer的多次执行
// 避免了多次触发回流（或者说更新到DOM的时间成本比较高）
```

### 4、queueWatcher()

```js
// 入口： src/core/observer/scheduler.js
// 也就是进入Watcher队列调度逻辑

// 下面用简化版
```

```js
// 进入queueWatcher
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  // 避免相同Watcher的多次执行
  if (has[id] == null) {
    has[id] = true
    queue.push(watcher)
    // queue the flush
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}

// nextTick会等一个时间片后，执行flushSchedulerQueue
// 执行flushSchedulerQueue时，会重置waiting为false

// 1、去重，避免相同Watcher重复执行。如多次赋值，相关Watcher执行一次就行，因为拿到的是最新值
// 2、在一个时间片内，会push到队列。然后，一起执行。
//    好处：去重、排序
```
### 5、flushSchedulerQueue()
冲洗调度队列，也就是执行调度队列
```js
function flushSchedulerQueue () {
  let watcher, id
  // 排序,保证执行顺序
  queue.sort((a, b) => a.id - b.id)
  // 执行Watcher.run()
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    watcher.run()
  }
  // 重置
  resetSchedulerState()
}

function resetSchedulerState () {
  index = queue.length  = 0
  has = {}
  waiting = false
}
```
### 6、watcher.run()

```js
run () {
    if (this.active) {
        const value = this.get()
        if (
        value !== this.value ||
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
                // 执行我们的cb
                this.cb.call(this.vm, value, oldValue)
            }
        }
    }
}
```
### 7、测试

```js
// 先总结：

// 1、触发set
// 2、触发依赖收集的Watcher更新：subs[i].update()
//    如一次赋值，相关的Watcher都会更新！！！（保证功能完整，不会出现有些地方没更新到，不统一）
// 3、进入queueWatcher
//    同一批时间段的，都会进入队列中，等待时间片后。一起执行
//    好处？1、可去重； 2、排序（一个依赖收集的Watcher是没有顺序的，不同依赖收集的Watcher放到同一个队列更是没有顺序的，这里保证执行顺序）

// 4、一个时间片后，执行flushSchedulerQueue，保证Watcher顺序后，一个个拿到值，然后执行cb。
// 5、重置：resetSchedulerState。准备接收下一批需要更新的Watcher

// 如果我们也想让一个对象是响应式的怎么做
// 1、$set
// 2、observable( object )
```