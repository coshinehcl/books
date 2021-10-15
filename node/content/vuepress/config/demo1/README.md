# 配置

```js
// 站点配置（本节）
// 主题配置（本节）
// markDown配置
// 插件配置
```
```js
// 站点配置

// 1、base 部署站点的基础路径 默认 /
// 2、lang 它将会在最终渲染出的 HTML 中作为 <html> 标签的 lang 属性
// 3、title 站点的标题
// 4、description 它将会在最终渲染出的 HTML 中作为 <meta name="description" /> 标签的 content 属性
// 5、head [] 在最终渲染出的 HTML 的 <head> 标签内加入的额外标签。
```
```js
// 主题配置

// 这个是本文的重点，重点介绍导航栏和侧边栏
```
## 一、配置项

(配置项)[https://v2.vuepress.vuejs.org/zh/reference/default-theme/config.html#%E5%9F%BA%E7%A1%80%E9%85%8D%E7%BD%AE]

### 1、home
```js
// 配置首页路径
```

### 2、navbar
```js
// 导航栏
// 类型：false | (NavbarItem | NavbarGroup | string)[]
// 默认:[]
```
```js
// 配置项：navbar

navbar: [
    // NavbarItem
    {
    text: 'Foo',
    link: '/foo/',
    },
    // NavbarGroup
    {
    text: 'Group',
    children: ['/group/foo.md', '/group/bar.md'],
    },
    // 字符串 - 页面文件路径
    '/bar/README.md',
]

// 说明：
// 1、支持嵌套（一级，二级，三级菜单）
```
```js
// 配置一个和教程类似的导航栏

navbar: [
    {
        text: '指南',
        link: '/',
    },
    {
        text: '参考',
        children: [
            {
                text:'VuePress',
                link: '/',
            },
            {
                text:'命令行接口',
                link: '/',
            },
            {
                text:'打包工具',
                children:[
                    {
                        text:'Webpack',
                        link: '/',
                    },
                    {
                        text:'Vite',
                        link: '/',
                    },
                ]
            }
        ],
    },
    {
        text: '插件',
        children: [
                {
                    text:'常用功能',
                    children:[
                        {
                            text:'back-to-top',
                            link: '/',
                        },
                        {
                            text:'container',
                            link: '/',
                        },
                    ]
                },
                {
                text:'内容搜索',
                children:[
                    {
                        text:'docsSearch',
                        link: '/',
                    },
                    {
                        text:'search',
                        link: '/',
                    },
                ] 
                }
        ],

    },
    {
        text:'v2.0.0-beta',
        children:[
            {
                text:'更新日志',
                link:'https://www.baidu.com'
            },
            {
                text:'v2',
                link:'https://www.baidu.com'
            },
            {
                text:'v2',
                link:'https://www.baidu.com'
            }
        ]
    }
]

// 总结：很简单，嵌套就行了。
// 如果使用的是外链，则会旁边icon标识
```

### 3、侧边栏

```js
// 类型： false | 'auto' | SidebarConfigArray | SidebarConfigObject
// 默认值： 'auto'
// 你可以通过页面的 sidebar frontmatter 来覆盖这个全局配置。
```
```js
// 'auto'

// 这个根据README.md中的h1、h2、...自动生成的
```
```js
// {} 或 []
// []：也就是配置一套所有页面共用的侧边栏
// {}：也就是配置不同页面的侧边栏

sidebar: [
    // SidebarItem
    {
    text: 'Foo',
    link: '/foo/',
    children: [
        // SidebarItem
        {
        text: 'github',
        link: 'https://github.com',
        children: [],
        },
        // 字符串 - 页面文件路径
        '/foo/bar.md',
    ],
    },
    // 字符串 - 页面文件路径
    '/bar/README.md',
],

// 手动配置一个
sidebar:[
    {
        text:'手动生成的目录',
        children:[
            {
                text:'首页',
                link:'#home',
            },
            {
                text:'navbar',
                link:'#navbar',
                children:[
                    {
                        text:'测试三级目录',
                        link:'#测试三级目录',
                        children:[
                            {
                                text:'测试四级目录',
                                link:'#测试四级目录',
                            }
                        ]
                    }
                ]
            },
            {
                text:'siderbar',
                link:'#siderbar',
            },

        ]
    }
]

// 如果是当前页面，直接使用#xx锚地即可
```

## 二、测试

## 三、总结