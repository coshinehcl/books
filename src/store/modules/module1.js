// state
const state = () => ({
    currentMenu:"",
    currentContent:""
})

// getters
const getters = {
    currentContentFormat(state,getters,rootState, rootGetters){
        let str = state.currentContent;
        const list = [];
        while(str.length) {
            let index = str.indexOf('</p>')
            console.log('index',index)
            list.push(str.slice(0,index + 4).replace('<p>','').replace('</p>','').replaceAll('\n',''));
            str = str.slice(index + 4)
        }
        console.log('list',list.length)
       return list
    }
}

// mutations
const mutations = {
    setCurrentMenu:(state,v)=>{
        state.currentContent = v;
    },
    setCurrentContent:(state,v) => {
        state.currentContent = v;
    }
}

// actions
const actions = {
    search:({state,commit,dispatch,},v)=>{
        console.log('');
        
    }
}
export default {
    // namespaced: true,
    state,
    getters,
    actions,
    mutations
  }