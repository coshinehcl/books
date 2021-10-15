module.exports = {
    title:'第一个文档',
    // theme: 'yuu',
    themeConfig: {
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
      ],
      repo: 'https://gitlab.com/foo/bar',
      repoLabel:'xxx',
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
    },

  }