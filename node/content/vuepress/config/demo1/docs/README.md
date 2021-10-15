# 首页

## home

- 默认值： /
- 详情：
- 首页的路径。
- 它将被用于：
- 导航栏中 Logo 的链接
- 404 页面的 返回首页 链接

## navbar

```txt
类型： false | (NavbarItem | NavbarGroup | string)[]

默认值： []

详情：

导航栏配置。

设置为 false 可以禁用导航栏。

为了配置导航栏元素，你可以将其设置为 导航栏数组 ，其中的每个元素是 NavbarItem 对象、 NavbarGroup 对象、或者字符串：

NavbarItem 对象应该有一个 text 字段和一个 link 字段，还有一个可选的 activeMatch 字段。
NavbarGroup 对象应该有一个 text 字段和一个 children 字段。 children 字段同样是一个 导航栏数组 。
字符串应为目标页面文件的路径。它将会被转换为 NavbarItem 对象，将页面标题作为 text ，将页面路由路径作为 link 。
```
### 测试三级目录

#### 测试四级目录（不起效果）

## siderbar

<Badge type="tip" text="v2" vertical="top" />


::: tip
这是一个提示
:::
😀

[[toc]]

```js
import type { UserConfig } from '@vuepress/cli'

export const config: UserConfig = {
  title: '你好， VuePress',

  themeConfig: {
    logo: 'https://vuejs.org/images/logo.png',
  },
}
```
```md:no-v-pre
<!-- 这里会被 Vue 编译 -->
1 + 2 + 3 = {{ 1 + 2 + 3 }}
```
一加一等于： {{ 1 + 1 }}
{{name}}

<span v-for="i in 3"> span: {{ i }} </span>
<button @click="onBtnClick">点我</button>

<script>
export default {
    name:'content',
    data(){
        return {
            name:'hcl'
        }
    },
    methods:{
        onBtnClick(){
            console.log(this)
        }
    }
}
</script>