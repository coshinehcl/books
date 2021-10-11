import VueRouter from 'vue-router'
import Vue from 'vue'
Vue.use(VueRouter)
const files = require.context('./',false,/.js$/);
const childRouter = files.keys().filter(i => i!=='./index.js').map(item => files(item).default)
console.log(childRouter)
const Router = new VueRouter({
    routes:childRouter.reduce((total,cur)=>{
        total.push(...cur)
        return total;
    },[])
})
export default Router