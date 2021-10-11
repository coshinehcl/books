<template>
<div class="home-wrapper">
    <my-menu class="slider-container"></my-menu>
    <my-content class="content-container"></my-content>
</div>
</template>
<script>
import myMenu from '@/components/myMenu.vue'
import myContent from '@/components/myContent.vue'
export default {
    name:'App',
    components:{
        myMenu,
        myContent
    }
}
</script>
<style scoped lang="less">
.home-wrapper {
    display: flex;
    height:100vh;
    .slider-container {
        width: 200px;
        height: 100%;
    }
    .content-container {
        position: relative;
        flex: 1;
        height: 100%;
        overflow-y: scroll;
    }
}
</style>