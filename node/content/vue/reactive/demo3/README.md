# Watch复杂场景
考虑，父组件，子组建之间的Watcher的关系。
及思考下生命周期是什么时候触发的。

## 一、测试

### 1、测试代码
```js
<script type="module">
    import Vue from './vue.esm.browser.js';
    const vm = new Vue({
        name:"hcl",
        components:{
            child1:{
                props:{
                    persion1:{
                        type:Object,
                        default:()=>{}
                    },
                    color:''
                },
                template:`
                    <div>{{persion1.name}}{{color}}</div>
                `,
                created(){
                    console.log('created')
                }
            },

            
        },
        data(){
            return {
                persion:{
                    name:'hcl',
                    details:{
                        age:20,
                        job:'web'
                    }
                },
                color:'red'
            }
        },
        watch:{
            persion:{
                handler(newV){
                    console.log('parent watch',newV)
                },
                deep:true
            }
        },
        created(){
        }
    })
    vm.$mount('#app')
</script>
```
### 2、结果
```js
// 渲染Watch的依赖收集是在
let updateComponent = () => {
    vm._update(vm._render(), hydrating)
}
// 准确来说，是在__patch__阶段。

// 父组件实例化 => 走Observer
defineReactive $attrs Dep {id: 0, subs: Array(0)}
defineReactive $listeners Dep {id: 1, subs: Array(0)}
Observer {persion: {…}, color: 'red'} Dep {id: 2, subs: Array(0)}
defineReactive persion Dep {id: 3, subs: Array(0)}
Observer {name: 'hcl', details: {…}} Dep {id: 4, subs: Array(0)}
defineReactive name Dep {id: 5, subs: Array(0)}
defineReactive details Dep {id: 6, subs: Array(0)}
Observer {age: 20, job: 'web'} Dep {id: 7, subs: Array(0)}
defineReactive age Dep {id: 8, subs: Array(0)}
defineReactive job Dep {id: 9, subs: Array(0)}
defineReactive color Dep {id: 10, subs: Array(0)}

// 父组件用户watcher
Watcher persion ƒ (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]];
    }
    console.log('obj',obj)
    return obj
  } 1 
(7) [Dep, Dep, Dep, Dep, Dep, Dep, Dep]

// 下面走父组件$mount => render => __patch__
// __patch__是深度遍历进去。如果后代是组件，会实例化子组件

// 子组件实例化 => 走Observer
defineReactive $attrs Dep {id: 11, subs: Array(0)}
defineReactive $listeners Dep {id: 12, subs: Array(0)}
defineReactive persion1 Dep {id: 13, subs: Array(0)}
defineReactive color Dep {id: 14, subs: Array(0)}
Observer {} Dep {id: 15, subs: Array(0)} // 这个是persion1 默认的值 的Observer

// 子组件：$mount => render => __patch__
// 子组件先输出，此时父组件，__patch__还没完。

// 我们重点来关注下这里：
Watcher () => {
      vm._update(vm._render(), hydrating);
    } () => {
      vm._update(vm._render(), hydrating);
    } 3 
(4) [Dep, Dep, Dep, Dep]
    0: Dep {id: 13, subs: Array(1)} // 依赖收集persion1
    // 访问persion1时，因为这里是引用类型
    // 所以真实访问是父组建的persion。依赖收集
    1: Dep {id: 4, subs: Array(3)}
    // 访问persion1.name。其实是访问perison.name。依赖收集
    2: Dep {id: 5, subs: Array(3)}
    // 依赖收集color。因为是基础类型，访问的是自己的。
    3: Dep {id: 14, subs: Array(1)}

// 此时，父组件，__patch__完成
Watcher () => {
      vm._update(vm._render(), hydrating);
    } () => {
      vm._update(vm._render(), hydrating);
    } 2 
(8) [Dep, Dep, Dep, Dep, Dep, Dep, Dep, Dep]
    0: Dep {id: 3, subs: Array(2)}
    1: Dep {id: 4, subs: Array(3)}
    2: Dep {id: 5, subs: Array(3)}
    3: Dep {id: 6, subs: Array(2)}
    4: Dep {id: 7, subs: Array(2)}
    5: Dep {id: 8, subs: Array(2)}
    6: Dep {id: 9, subs: Array(2)}
    7: Dep {id: 10, subs: Array(1)}

// 注意：__patch__是子先完成。父再完成
// 所以最开始__patch__是，子组件先完成。再父组件完成。
// 后续，更新的时候，不会再深度遍历了。会直接更新自身。！！！！
// 因为收集了依赖，所以依赖会去派发子组件。

// 这里补充下更新队列
function flushSchedulerQueue () {
    // 1、排序,保证，用户Watch在渲染Watcher之前。父渲染Watcher在子渲染Watcher之前。
    queue.sort((a, b) => a.id - b.id);
    // 2、执行
    for (index = 0; index < queue.length; index++) {
        // 所以，父先输出:beforeUpdate。
        // 然后子组件，输出beforeUpdate。
        if (watcher.before) {
            watcher.before();
        }
        // 走更新
        watcher.run();
    }
    // 3、更新状态
    callUpdatedHooks(updatedQueue);
}

function callUpdatedHooks (queue) {
  let i = queue.length;
  // 也就是从后向前，更新状态
  // 所以子先输出：updated。其实这个时候，父亲也已经完成。
  // 然后在父输出：updated。
  while (i--) {
    const watcher = queue[i];
    const vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated');
    }
  }
}

// 初始化
// 父beforeCreated、created
// 父 __patch__ ：
//   深度遍历,子组件:beforeCreated、created
//           子组件__patch__
//           子组件遍历完
//           子组件插入到父节点
{
    createChildren(vnode, children, insertedVnodeQueue);
    // 这里是走组件节点的create hook
    // 并不是组件的hook
    if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
    }
    // 遍历完所有子组件后，把自己挂载到父节点。
    insert(parentElm, vnode.elm, refElm);
}
// 父组件，遍历完，
// 然后父组建，挂载到父节点那里。
// 此时，已经挂载到document上了。
// 执行mounted的hooks是什么时间呢？

// 代码
invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);

function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    // 这里有说明，也就是前面子组件，也会走__patch__。
    // 也会走invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    // 但不会执行else。也就是不会执行mounted hooks。
    // 只有遍历完根组建，才会走else。
    // 也就是这个时候，把之前收集的子组件的hooks先执行。
    if (isTrue(initial) && isDef(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue
    } else {
        for (let i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i])
        }
    }
}
// 到这个阶段，按照顺序，从内到外。执行mounted。
// 根节点的呢？
// mountComponent
function mountComponent (){
    callHook(vm, 'beforeMount');
    updateComponent = () => {
      vm._update(vm._render(), hydrating);
    };
    new Watcher(vm, updateComponent, noop, {
        before () {
        if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate');
        }
        }
    }, true /* isRenderWatcher */);
    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    // 重点关注这里。
    // 因为子组件：vm.$vnode = parentVnode
    // 所以，子组件__patch__的时候，不会进这里。只有root组件，才会进这里。
    if (vm.$vnode == null) {
        vm._isMounted = true;
        callHook(vm, 'mounted');
    }
}
// 这里说明下：vm.$vnode挂载的是，父组件的Vnode。
// 自己的Vnode。挂载在哪里呢？vm._vnode
// 逻辑比较多。整理如下：
// 根组件__patch__
//    子Vnode继续深度遍历：如果子Vnode是组件，创建vm。(走$mount。走渲染Watcher 触发getter),走__patch__。
//        孙Vnode继续深度遍历
//            重孙Vnode继续深度遍历(假设到此)
//            重孙Vnode遍历完，执行insert(parentElm, vnode.elm, refElm);
//        孙Vnode遍历完，执行insert(parentElm, vnode.elm, refElm);
//    子Vnode遍历完，执行insert(parentElm, vnode.elm, refElm);

// 到此，root下，所有都遍历完了。且挂载到自身el上了。
// root遍历完，执行执行insert(parentElm, vnode.elm, refElm);
// 到此，其实所有的el都已经挂载到了document上了。！！！！

// 6、执行子组件mounted hooks：重孙mounted、孙mounted、子mounted
// 7、回到root的mountComponent。执行root的mounted。

// 更新时
// 依赖派发
// 父组件，先执行，输出beforeUpdate。执行this.run。__patch__后。不会走深度遍历，只是更新自身。
// 子组件，后更新，输出beforeUpdate。执行this.run。__patch__后。不会走深度遍历，只是更新自身。
// 派发队列，从后到前，输出updated()。也就是子组件，先输出，其实这个时候父亲更新完成了。父组件后输出。

// 也就是mounted和updated的hooks执行时机，并不是紧跟着实际mounted时机执行的。只是后面另外执行的。
// 总结就是：
// mounted
// 1、后代依次mounted到父节点
// 2、root mounted到#app（到此，其实所有都已经mounted。只是还没有执行hooks而已！！！）
// 3、从后到前，执行后代的mounted
// 4、执行root 的mounted
// updated
// 1、祖先先执行cb。更新自身。
// 2、后代依次执行cb。更新自身。
// 直到更新队列完成。
// 此时，已经全部更新完，只是还没有执行hooks
// 然后，从后到前，执行所有的updated。


// 销毁时
// 父组件，输出beforeDestroy
// 如果有儿子，儿子也走销毁
//   儿子输出：beforeDestroy
//   儿子销毁完，输出destroyed
// 父亲销毁完，输出destroyed
// 也就是mounted是实时的。
```
## 三、总结
```js
// 依赖收集是：
// 1、$attrs会走defineReactive
// 2、props深度遍历，属性走defineReactive。默认值会走Observer
// 3、$data深度遍历，属性走走defineReactive。值走Observer
// 3、每个组件，都有一个渲染Watcher，会收集依赖。
//    如果props接收的是对象，且在模板中使用了。则访问的时候，实际访问是父组件的对象，所以也会收集进来。！！！
//    如果子组件，直接修改了父组件中引用的属性，
//    如：父组件中,persion => 子组件persion1。
//    然后子组件中：this.persion1.details = {'child1':2}。此时，父渲染Watcher收集了子组件变量的依赖。
//    当然，如果props 接收的属性，是基本类型，则依赖是这个属性，不会访问到父那里，所以此时不建议修改。！！！
//    虽然支持这样做。但最好是：显示$emit出去。这样方便后期维护

// 再补充下，set时，是否一定会触发派发
set: function reactiveSetter (newVal) {
    const value = getter ? getter.call(obj) : val
    // 也就是，如果是 新值===旧值 或者 新旧值为NaN
    // 就不会触发派发。
    // 当然可能子属性，会派发。
    // 当前这里没考虑数组的情况。数组它有它自己的派发。
    // 所以当我们Watcher的时候，如果cb中。又修改了依赖。则要注意，避免死循环。
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
    childOb = !shallow && observe(newVal)
    dep.notify()
}





// 生命周期总结就是：

// mounted
// 1、后代依次mounted到父节点
// 2、root mounted到#app（到此，其实所有都已经mounted。只是还没有执行hooks而已！！！）
// 3、从后到前，执行后代的mounted
// 4、执行root 的mounted

// updated
// 1、祖先先执行cb。更新自身。
// 2、后代依次执行cb。更新自身。
// 直到更新队列完成。
// 此时，已经全部更新完，只是还没有执行hooks
// 然后，从后到前，执行所有的updated。


// destroyed
// 父组件，输出beforeDestroy
// 如果有儿子，儿子也走销毁
//   儿子输出：beforeDestroy
//   儿子销毁完，输出destroyed
// 父亲销毁完，输出destroyed
// 也就是mounted是实时的。
```