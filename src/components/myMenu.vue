<template>
  <div class="silder-wrapper">
    <Menu ref="menu" mode="vertical" :active-name="activeName" :open-names="openNames" width="auto" @on-select="onSelect">
      <template v-for="item in menuList">
        <Menu-item v-if="!item.children" :name="item.key" :key="item.key">
          <Icon type="ios-paper"></Icon>
          <renderItem :item="item" />
        </Menu-item>
        <Submenu v-else :name="item.key" :key="item.key">      
          <template slot="title">
            <Icon type="stats-bars"></Icon>
              <renderItem :item="item" />
          </template>
          <div v-for="itemChild in item.children" :key="itemChild.key">
            <Menu-group v-if="itemChild.type === 'group'" :title="itemChild.title">
              <Menu-item v-for="itemChildGroupItem in itemChild.list" :key="itemChildGroupItem.key" :name="itemChildGroupItem.key">
                <Icon type="ios-paper"></Icon>
                 <renderItem :item="itemChildGroupItem" />
              </Menu-item>
            </Menu-group>
            <Menu-item v-else :key="itemChild.key" :name="itemChild.key">
              <Icon type="ios-paper"></Icon>
              <renderItem :item="itemChild" />
            </Menu-item>
          </div>

        </Submenu>
      </template>
    </Menu>
  </div>
</template>
<script>
import bus from '@/util/bus.js'
export default {
  name: "MyMenu",
  components:{
    'renderItem':{
      props:{
        item:{
          type:Object,
          default:()=>{}
        }
      },
      render(h){
        if(this.item.desc) {
          return h('Tooltip',{
            props:{
              content:this.item.desc,
              delay:500
            }
          },this.item.title)
        } else {
          return h('span',this.item.title)
        }
      }
    }
  },
  data(){
    return {
      menuList:[],
      activeName:'',
      openNames:[]
    }
  },
  created(){
    this.getMenu()
    bus.$on('getMenu',this.getMenu);
    this.$on('destroyed',()=>bus.$off('getMenu',this.getMenu))
  },
  methods:{
    getMenu(){
      this.$request.get('/getMenu').then(res => {
        this.menuList = res.data.list;
        const activeKey = res.data.activeKey
        if(activeKey) {
          this.afterMounted(this.afterGetData,activeKey)
        }
      })
    },
    afterMounted(cb,...args){
      if(this._isMounted) {
        cb(...args);
      } else {
        this.$on('hook:mounted',()=>{
          cb(...args)
        });
      }
    },
    afterGetData(args){
      const config = { childList: true };
      const observer = new MutationObserver(()=>{
        this.openActiveMenu(args)
        observer.disconnect();
      });
      observer.observe(this.$refs.menu.$el, config);
    },
    openActiveMenu(activeName){
      let findItem = ''
      const isFind = this.$refs.menu.$children.some(child => {
        const name = child.$options.name;
        if(name === 'MenuItem') {
          return child.name === activeName && !!(findItem = child)
        } else if(name === 'Submenu'){
          return child.$children.some(subChild => {
            const subName = subChild.$options.name;
            if(subName === 'MenuGroup') {
              return subChild.$children.some(graChild => {
                return graChild.name === activeName && !!(findItem = graChild)
              })
            } else {
              return subName === 'MenuItem' && subName.name === activeName && !!(findItem = subChild);
            }
          })
        } else {
          return false
        }
      })
      if(isFind) {
        this.activeName = activeName;
        const findParent = this.findParent(findItem,'Submenu',4)
        if(findParent) {
          this.openNames = [findParent.name]
          // 这边需要手动调用方法
          this.$nextTick(()=> this.$refs.menu.updateOpened());
        }
        this.onSelect(activeName)
      }
    },
    findParent(self,componentName,maxTimes){
      if(self && componentName ) {
        let parent = self.$parent;
        let name = parent.$options.name;
        while (parent && (!name || name !== componentName) && maxTimes > 0) {
            maxTimes--;
            parent = parent.$parent;
            if (parent) {
              name = parent.$options.name;
            }
        }
        return parent
      }
    },
    onSelect(name){
      this.activeName = name;
      this.$router.push({
        name:'content',
        query:{
          key:name,
          t:new Date().getTime().toString().slice(-5)
        }
      })
    }
  }
}
</script>
<style scoped lang="less">
.silder-wrapper {
  position: relative;
  overflow: scroll;
  border-right: 1px solid #ddd;
  ul {
    &::after {
      content:none
    }
  }
}
</style>
