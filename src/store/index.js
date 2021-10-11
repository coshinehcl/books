import Vue from 'vue'
import Vuex from 'vuex'
import module1 from './modules/module1'
Vue.use(Vuex)
export default new Vuex.Store({
    modules: {
        module1
    },
    state:{
        a:'hcl'
    },
    getters:{
        geta(state){
            console.log(state)
            return state.a + 'format'
        }
    },
    mutations:{
        setA(state,v){
            state.a = v
        }
    },
    actions:{
        setAAc({commit},v){
            commit('setA',v)
        }
    },
    strict: true
  })