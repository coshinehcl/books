module.exports = {
    title: 'Hello122 VuePress',
    description: 'Just playing around',
    markdown:{
        lineNumbers:true
    },
    themeConfig:{
        nav: [
            { text: 'External', link: 'https://google.com', target:'_self', rel:'' },
            {
                text:'twoLevel',
                items:[
                    { text: 'Guide', link: '/hello/', target:'_blank' },
                    {
                        text:'threeLevel',
                        items:[
                            { text: 'Guide', link: '/hello/' },
                            { text: 'Guide', link: '/hello/' }
                        ]
                    }
                ]
            }
        ]
    }
  }