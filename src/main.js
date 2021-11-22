import Vue from 'vue'
import Router from '@/router'
import store from '@/store'
import App from './app.vue'
import iView from 'iview'
import 'iview/dist/styles/iview.css';    // 使用 CSS
import * as globalApi from '@/util/globalApi.js'
import request from '@/util/request.js'
// import a from 'a'
console.dir(Vue)
Vue.use(iView);
Vue.prototype.$request = request;
Object.keys(globalApi).forEach(i => {
  Vue.prototype[i] = globalApi[i];
})

var app = new Vue({
  router:Router,
  store,
  render:(h)=>h(App),
    
}).$mount('#app')