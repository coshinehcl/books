<template>
    <div @click="globalClickHandle">
        <div v-html="menuList"></div>
        <div id="content" class="content" v-html="content"></div>
        <div data-info='{"type":"top"}' class="to-top">Top</div>
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
           const menu = {
               list:[],
               currentLevel:1 // 支持从hn开始
           };
           let index = 0;
           // h1...h3
           // 这边要求文档，严格要求h1...h3格式嵌套来使用，这边才好解析
           [1,2,3].forEach(i => this.generatorMenuBody(menu,i))
            console.log('menu.list',menu.list)
           // 根据menu生成内容
           const menuList = menu.list.reduce((total,level1)=> {
               const getDataInfo = (item) => {
                   return `${JSON.stringify({tag:item.tag,tagIndex:item.tagIndex,type:'query'})}`
               }
               if(level1.children.length) {
                    total +=`<div class="content-menu-item content-menu-level1" data-info=${getDataInfo(level1)}>${level1.content}</div>`
                    level1.children.forEach(level2 => {
                        if(level2.children.length) {
                            total +='<div>';
                            total +=`<div class="content-menu-item content-menu-level2" data-info=${getDataInfo(level2)}>${level2.content}</div>`
                            level2.children.forEach(level3 => {
                                total += `<div class="content-menu-item content-menu-level3" data-info=${getDataInfo(level3)}>${level3.content}</div>`
                            })
                            total +='</div>'
                        } else {
                            total += `<div class="content-menu-item content-menu-level2" data-info=${getDataInfo(level2)}>${level2.content}</div>`
                        }
                    })
               } else {
                   total += `<div class="content-menu-item content-menu-level1" :data-info=${getDataInfo(level1)}>${level1.content}</div>`
               }
               return total;
           },'') || '' 
           this.menuList = `<div class="content-menu">${menuList}</div>`
        },
        // tag 要查找哪个标签，level放在第几层
        // md不推荐超过3个层级
        generatorMenuBody(menu,level){
            const tag = `h${level}`;
            const menuList = menu.list || [];
            const content = this.content;
            const contentLen = content.length

            // 开始遍历
            let index = 0;
            let tagIndex = 0;
            do{
               const findStartIndex = content.indexOf(`<${tag}>`,index);
               const findEndIndex = content.indexOf(`</${tag}>`,findStartIndex);
                if(findStartIndex !== -1 && findEndIndex !== -1) {
                    const menuItem = {
                        // 自身属性
                        tag,
                        level,
                        tagIndex, // 该标签下的第几个，从0开始，用于定位
                        content:content.substring(findStartIndex + 4,findEndIndex),
                        start:findStartIndex,
                        end:findEndIndex,
                        // 关系属性
                        children:[],
                        parent:null
                    }
                    if(level === 1) {
                        menuList.push(menuItem)
                    } else if(level === 2) {
                        const oneLevelInsertIndex = menuList.findIndex(i => i.start > findEndIndex);
                        if(oneLevelInsertIndex !== -1) {
                            menuItem.parent = menuList[oneLevelInsertIndex - 1];
                        } else {
                            menuItem.parent = menuList.slice(-1)[0];
                        }
                        menuItem.parent.children.push(menuItem)
                    } else if(level === 3) {
                        let onewLevelInsertIndex = -1;
                        let twoLevelInsertIndex = -1;
                        menuList.some((i,oneIndex) => {
                            i.children.findIndex((twoI,twoIndex) => {
                                const flag = twoI.start > findEndIndex
                                if(flag) {
                                    onewLevelInsertIndex = oneIndex;
                                    twoLevelInsertIndex = twoIndex
                                }
                                return flag;
                            })
                        })
                        if(twoLevelInsertIndex !== -1) {
                            menuItem.parent = menuList[onewLevelInsertIndex].children[twoLevelInsertIndex - 1];
                        } else {
                            menuItem.parent = menuList.slice(-1)[0].children.slice(-1)[0]
                        }
                        menuItem.parent.children.push(menuItem)
                    }
                    index = findEndIndex
                } else {
                    index = contentLen
                }
                tagIndex++;
           } while(index < contentLen)
        },
        globalClickHandle(e){
            console.log(e.target)
            if(e.target.nodeName === 'IMG') {
                window.open(e.target.src)
            } else if(e.target.dataset.info) {
                const info = JSON.parse(e.target.dataset.info);
                // h1...h3
                if(info.type === 'query') {
                    try {
                        const queryItem = document.querySelectorAll(info.tag)[info.tagIndex];
                        queryItem.scrollIntoView()
                    } catch(err){}
                    
                } else if(info.type === 'top') {
                   document.querySelector('#contentBody').scrollTop = 0;
                }
            }
            console.log(e.target.dataset)
        },
    }
}
</script>
<style lang="less" scoped>
.to-top {
    position: fixed;
    right: 20px;
    bottom: 20px;
    padding: 30px;
   
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    border-radius: 50px;
    border:1px solid #eee;
    background: rgba(238, 238, 238,.5);
}
</style>
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
        .content-menu-item {
            cursor: pointer;
            color: rgb(45, 140, 240);
            &:hover {
                color: rgba(45, 140, 240,.7);
            }
        }
        .content-menu-level2 {
            padding-left: 20px;
        }
        .content-menu-level3 {
            padding-left: 40px;
        }

    }

    // reset
    ul,html,body,li {
        margin: 0;
    }
    ul {
        line-height: 1;
    }
</style>