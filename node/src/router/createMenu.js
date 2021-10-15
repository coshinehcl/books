const fs = require('fs');
const path = require('path');
const exportObj = {
    list:[],
    activeKey:''
}
const updateMenuList = () => {
    // 获取配置
    let readDetail = {}
    try {
        // 读
        const data = fs.readFileSync(path.resolve(__dirname,'../sql/readDetail.json'));
        // 更新
        readDetail = JSON.parse(data.toString() || '{}');
    } catch(err) {
        console.log(err)
    }
    const menulist = []
    const contentDir = path.resolve(__dirname,'../../content')
    const readDir = (entry)=>{
        const dirInfo = fs.readdirSync(entry);
        dirInfo.forEach(item => {
            const location = path.join(entry,item)
            const info = fs.statSync(location)
            console.log()
            const relativeContentLen = path.relative(location,contentDir).split('/').length
            if(info.isDirectory() && relativeContentLen <= 3){
                if(['src','dist','node_modules'].every(i => location.indexOf(i) === -1)){
                    readDir(location)
                }
            }else{
                if(location.indexOf('.md') !== -1) {
                    menulist.push(location)
                }
            }
        })
    }
    readDir(contentDir);
    // 判断是否是相同的一级目录
    const isSameOneLevel = (lastItemPath,curItemPath) => {
        // 只需要对比最后一位是不是一样就行
        return lastItemPath.length && lastItemPath[lastItemPath.length -1] === curItemPath[curItemPath.length -1]
    }
    // 判断是否是相同的group
    const isSameGroup = (lastItemPath,curItemPath) => {
        if(lastItemPath.length === 3 && curItemPath.length === 3) {
            // 一级目录和group是一样的
            return lastItemPath[2] === curItemPath[2] && lastItemPath[1] === curItemPath[1]
        } else {
            return false;
        }
    }
    const menuItemAdd = (menu,lastItemPath,curItemPath) => {
        // menu结构：[{
        //     title:item[2],
        //     key,
        //     children:[
        //         {
        //             title:item[1],
        //             key,
        //             type:'group', 
        //             list:[
        //                 {
        //                     title:item[0],
        //                     key
        //                 }
        //             ]
        //         }
        //     ]
        // }]
        const key = JSON.parse(JSON.stringify(curItemPath)).reverse().join('.') // 路径，用于加载content
        const curItem = {
            title:curItemPath[0],
            key,
            desc:(readDetail[key] || {}).desc || ''
        }
        const lastMenuItem = menu.slice(-1)[0];
        if(isSameGroup(lastItemPath,curItemPath)) {
            const lastMenuItemLastChild = lastMenuItem.children.slice(-1)[0];
            lastMenuItemLastChild.list.push(curItem)
        } else if(isSameOneLevel(lastItemPath,curItemPath)) {
            if(curItemPath.length === 3) {
                lastMenuItem.children.push({
                    title:curItemPath[1],
                    key,
                    type:'group',
                    list:[curItem]
                })
            } else {
                lastMenuItem.children.push(curItem)
            }
        } else {
            // menu新增item
            if(curItemPath.length === 3) {
                menu.push({
                    title:curItemPath[2],
                    key,
                    children:[{
                        title:curItemPath[1],
                        key,
                        type:'group',
                        list:[curItem]
                    }]
                })
            } else if(curItemPath.length === 2) {
                menu.push({
                    title:curItemPath[1],
                    key,
                    children:[curItem]
                })
            } else {
                menu.push(curItem) 
            }
        }
    }
    // console.log('menulist',menulist)
    let lastItemPath = []
    const formatMenuList = menulist.map(i=>i.split('/').reverse().slice(1,4)).reduce((menu,item)=>{
        // 三级目录：[demo1,options,commander]
        // 二级目录：[base,js]
        // 一级目录：[js]
        const contentIndex = item.findIndex(i => i === 'content');
        // 真正的路径为：content下的路径，后续使用的都是curItemPath
        const curItemPath = contentIndex=== -1 ? item : item.slice(0,contentIndex);
        menuItemAdd(menu,lastItemPath,curItemPath)
        // 记录上次操作的pathList
        lastItemPath = curItemPath;
        return menu;
    },[])

    // 排序
    const sortMenuList = () => {
        // 排序一级目录
        try {
            // 读
            const data = fs.readFileSync(path.resolve(__dirname,'../sql/readStar.json'));
            // 更新
            const dataParse = JSON.parse(data || '{}') || {};
            const getItemRate = (title) =>  {
                if(title === 'everyday') {
                    return Infinity;
                } else {
                    return dataParse[title] || 0
                }
            }
            // 从大到小排序，只排序一级目录
            formatMenuList.sort((l,r) => {
                const leftV = getItemRate(l.title);
                const rightV =  getItemRate(r.title);
                if(leftV < rightV) {
                    return 1;
                } else if(leftV === rightV) {
                    return 0
                } else {
                    return -1
                }
            })
        } catch(err){}
        // 排序二级目录：默认home是比重100.
        const twoLevelRate = require(path.resolve(__dirname,'../sql/twoLevelRate.json'));
        const getItemRate = (oneLevelItemTitle,twoLevelItemTitle) => {
            if(twoLevelItemTitle === 'home'){
                return 100;
            } else if(twoLevelItemTitle === 'end') {
                return -1;
            } else {
                return (twoLevelRate[oneLevelItemTitle] || {})[twoLevelItemTitle] || 0
            }
        }
        formatMenuList.forEach(oneLevelItem => {
            (oneLevelItem.children || []).sort((l,r) => {
                const leftV = getItemRate(oneLevelItem.title,l.title);
                const rightV = getItemRate(oneLevelItem.title,r.title);
                if(leftV < rightV) {
                    return 1;
                } else if(leftV === rightV) {
                    return 0
                } else {
                    return -1
                }
            })
        })
    }
    sortMenuList()
    // 更新list
    exportObj.list = formatMenuList
}
updateMenuList()

exportObj.updateMenuList = updateMenuList
module.exports = exportObj