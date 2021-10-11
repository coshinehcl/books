<template>
    <div class="header-wrapper">
        <Button type="primary" class="mr-20" @click="onOpen">打开</Button>
        <Button type="primary" class="mr-20" @click="onGetContent">刷新</Button>
        <Select :remote-method="getList" filterable  clearable style="width:200px;" @on-select="onSelect" >
            <Option v-for="item in list" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
    </div>
</template>
<script>
import bus from '@/util/bus.js'
export default {
    name:'Myheader',
    data(){
        return {
            value:'',
            list:[]
        }
    },
    methods:{
        getList(v){
            let list = this.$store.getters.currentContentFormat.map((i,index) => ({
                v:i,
                originIndex:index
            }));
            if(v){
                list = list.filter(i=>i.v.includes(v))
            }
            this.list = list.map(i=>({value:i.originIndex,label:i.v.slice(0,30)}));
        },
        onSelect(index){
            const list = document.querySelectorAll('#content p');
            list.forEach((i,idx)=> {
                if(idx === index) {
                    i.classList.add("actived")
                     i.scrollIntoView();
                } else {
                    i.classList.remove("actived")
                }
            })
        },
        onOpen(){
            const key = this.$route.query.key
            if(key) {
                this.$request.get('/open',{
                    params:{
                        key:decodeURIComponent(key)
                    }
                })
            }
        },
        onGetContent(){
           console.log('1',bus)
            bus.$emit('getMenu')
            bus.$emit('getContent')
        }
    }
}
</script>
<style lang="less" scoped>
.header-wrapper {
    display: flex;
    .mr-20 {
        margin-right: 20px;
    }
}
</style>