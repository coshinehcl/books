<template>
    <div class="content-wrapper">
         <my-header class="content-header"></my-header>
         <div class="content-body">
            <router-view></router-view>
         </div>
     </div>
</template>
<script>
import myHeader from './myHeader.vue'
console.log(myHeader)
export default {
    name:'MyContent11',
    components:{
        myHeader
    },
}
</script>
<style lang="less" scoped>
.content-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    .content-header {
        flex:0;
        position: relative;
        padding:20px;
        border-bottom: 1px solid #ddd;
    }
    .content-body {
        flex:1;
        flex-shrink: 0;
        padding:10px;
        overflow: scroll;
    }
}
</style>