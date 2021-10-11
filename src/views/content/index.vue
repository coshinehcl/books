<template>
    <div @click="globalClickHandle">
        <div v-html="menuList"></div>
        <div id="content" class="content" v-html="content"></div>
    </div>
</template>
<script>
import draggable from 'vuedraggable'
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
import 'highlight.js/styles/paraiso-dark.css' // 导入代码高亮样式
import Vue from 'vue'
import bus from '@/util/bus.js'
import test from './test.vue'
export default {
    name:'content',
    filters:{
        change(value,oldChar = '.',newChar = '/') {
            if(value && typeof value === 'string') {
                return value.split(oldChar).join(newChar)
            } else {
                return value
            }
        }
    },
    components:{
        test,
        draggable
    },
    data(){
        return {
            currentKey:"",
            t:'',
            content:'',
            menuList:''
        }
    },
    watch:{
        '$route.fullPath':{
            handler(){
                const key = this.$route.query.key
                if(key) {
                    this.currentKey = decodeURIComponent(key)
                    this.getContent()
                }
            },
            immediate:true
        },
        content(){
            this.generatorMenu()
        }
    },
    created(){
        bus.$on('getContent',this.getContent);
        this.$on('destroyed',()=>bus.$off('getContent',this.getContent))
    },
    mounted(){
         this.generatorMenu()
    },
    methods:{
        getContent(){
            this.$request.get('/getContent',{
                params:{
                    key:this.currentKey
                }
            }).then(res => {
                this.content = md.render(res.data);
                this.$store.commit('setCurrentContent',this.content);
                this.generatorMenu()
            })
        },
        generatorMenu(){
           const memu = {
               list:[],
               currentLevel:1 // 支持从hn开始
           };
           let index = 0;
           // h1...h5    
           [1,2,3,4,5].forEach(i => this.generatorMenuBody(memu,`h${i}`))
           // 更新文档
           this.renderContent = this.newContent;    
           // 根据menu生成内容
           const menuList = memu.list.reduce((total,level1)=> {
               if(level1.children.length) {
                    total +=`<div class="content-menu-level1">${level1.content}</div>`
                    level1.children.forEach(level2 => {
                        if(level2.children.length) {
                            total +='<div>'
                            total +=`<div classs="content-menu-level2">${level2.content}</div>`
                            level2.children.forEach(level3 => {
                                total += `<div class="content-menu-level3">${level3.content}</div>`
                            })
                            total +='</div>'
                        } else {
                            total += `<div class="content-menu-level2">${level2.content}</div>`
                        }
                    })
               } else {
                   total += `<div class="content-menu-level1">${level1.content}</div>`
               }
               return total;
           },'') || '' 
           this.menuList = `<div class="content-menu">${menuList}</div>`
           console.log(this.menuList,memu.list)
        },
        // tag 要查找哪个标签，level放在第几层
        // md不推荐超过3个层级
        generatorMenuBody(menu,tag){
            const menuList = menu.list || [];
            const currentLevel = menu.currentLevel || 1;
            const content = this.content;
            const contentLen = content.length
            let index = 0;
            // addflag
            let addLevel = 0; //0 代表没添加过
            do{
               const findStartIndex = content.indexOf(`<${tag}>`,index);
               const findEndIndex = content.indexOf(`</${tag}>`,findStartIndex);
                if(findStartIndex !== -1 && findEndIndex !== -1) {
                    const menuItem = {
                        tag,
                        level:currentLevel,
                        content:content.substring(findStartIndex + 4,findEndIndex),
                        start:findStartIndex,
                        end:findEndIndex,
                        children:[]
                    }
                    if(currentLevel === 1) {
                        addLevel = addLevel > 1 ? addLevel : 1;
                        // 直接作为第一级
                        menuList.push(menuItem)
                    } else if(currentLevel === 2) {
                        const findInsertIndex = menuList.findIndex(i => i.start > findEndIndex);
                        menuItem.findInsertIndex = findInsertIndex;
                        if(findInsertIndex !== -1) {
                            // 直接作为第二级
                            addLevel = addLevel > 2 ? addLevel : 2;
                            (menuList[findInsertIndex - 1].children || []).push(menuItem)
                        } else if(menuList.length) {
                            // 如果有长度，则push到最后item的children中,作为第二级
                            addLevel = addLevel > 2 ? addLevel : 2;
                            (menuList[menuList.length - 1].children || []).push(menuItem)
                        } else {
                            // 否则，直接作为第一级
                            menuList.push(menuItem)
                        }
                    } else if(currentLevel === 3) {
                        const findInsertIndex = menuList.findIndex(i => i.start > findEndIndex);
                        if(findInsertIndex !== -1) {
                            const findLevel2InsertIndex = (menuList[findInsertIndex - 1].children || []).findIndex(i => i.start > findEndIndex);
                            if(findLevel2InsertIndex !== -1 ) {
                                // 直接作为第三级
                                addLevel =  addLevel > 3 ? addLevel : 3;
                                menuList[findInsertIndex - 1].children[findLevel2InsertIndex - 1].children.push(menuItem)
                            } else if(menuList[findInsertIndex - 1].children.length){
                                // 如果有长度，则push到最后item的children中,作为第三级
                                addLevel =  addLevel > 3 ? addLevel : 3;
                                menuList[findInsertIndex - 1].children[menuList[findInsertIndex - 1].children.length - 1].push(menuItem)
                            } else {
                                // 否则，直接作为第二级
                                addLevel = addLevel > 2 ? addLevel : 2;
                                menuList[findInsertIndex - 1].children.push(menuItem)
                            }
                        } else if(menuList.length) {
                            // 如果有长度，则push到最后item的children中,作为第二级
                            addLevel = addLevel > 2 ? addLevel : 2;
                            (menuList[menuList.length - 1].children || []).push(menuItem)
                        } else {
                            menuList.push(menuItem)
                        }
                    }
                    index = findEndIndex
                } else {
                    index = contentLen
                }
           } while(index < contentLen)
           if(addLevel) {
               // addLevel说明遍历过第几个层级，下次遍历则新增1层级
               menu.currentLevel = addLevel + 1
           }
        },
        globalClickHandle(e){
            if(e.target.nodeName === 'IMG') {
                window.open(e.target.src)
            }
            console.log(e)
        }
    }
}
</script>
<style lang="less">
    .content {
        white-space: break-spaces;
        /deep/p {
            font-size: 14px;
            padding: 10px;
            border-radius: 10px;
        }
        /deep/.actived {
            background: #ccc;
            font-size: 16px;
        }
    }
    .test {
        display: flex;
        width: 200px;
        height: 200px;
        flex-direction: column;
        background: red;
        .test1{
            flex: 1;
        }
    }
    .draggable-wrapper {
        // display: flex;
        // flex-wrap: wrap;
        position: relative;
    }
    .draggable-item {
        position: absolute;
        padding: 20px;
        width: 200px;
        height: 300px;
        margin:20px;
        background: red;
    }
    // 主题
    pre {
        margin: 0;
        padding: 10px;
        background: rgba(238, 238, 238,.5);
        border-radius: 10px;
    }
    p,pre {
        font-size: 14px;
    }
    img {
        width:100%;
    }
    .content-menu {
        &::before {
            content:'目录结构';
            display: block;
            padding-bottom: 20px;
        }
        margin-bottom: 20px;
        font-size: 14px;
        padding:10px;
        border:1px solid #eee;
        .content-menu-level1 {
            cursor: pointer;
        }
        .content-menu-level2 {
            cursor: pointer;
            padding-left: 20px;
        }
    }
    // reset
    ul,html,body,li {
        margin: 0;
    }
</style>