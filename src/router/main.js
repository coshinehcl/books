export default [
    {
        path:'/',
        name:'content',
        component:()=>import('@/views/content/index.vue'),
        meta:{
            title:'首页'
        }
    },
    // {
    //     path:'/g',
    //     name:'index1',
    //     component:()=>import('@/views/content/index1.vue'),
    //     meta:{
    //         title:'首页'
    //     }
    // }
]