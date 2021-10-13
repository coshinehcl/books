
const fs = require('fs');
const path = require('path');
const os = require('os');
const requiredDir = ['w','project','study','books'];
const pathItem = (location) => ({
    name:location.split('/').slice(-1)[0],
    path:location,
    parentName:location.split('/').slice(-2,-1)[0],
    parentPath:location.split('/').slice(0,-1).join('/'),
})
const readDir = (entry)=>{
    const allDir = []
    const dirInfo = fs.readdirSync(entry);
    dirInfo.forEach(item => {
        const location = path.join(entry,item)
        const info = fs.statSync(location)
        if(info.isDirectory()){
            allDir.push(pathItem(location))
        }
    })
    return allDir
}
const getDirList = (filePath)=>{
    let ret = []
    const deskTop = path.resolve(os.homedir(),'Desktop');
    if(['',undefined,'Desktop'].includes(filePath)) {
        // 不带路径，默认使用桌面路径        
        const deskTopAllDir = readDir(deskTop);
        ret.push(pathItem(deskTop))
        deskTopAllDir.forEach(i => {
            if(requiredDir.includes(i.name)) {
                ret.push.apply(ret,readDir(i.path))
            }
        })
    } else {
        fileFullPath = path.resolve(deskTop,filePath)
        ret.push.apply(ret,readDir(fileFullPath))
    }
    ret = ret.map((i,index)=>({...i,id:index}))
    return ret;
}

const oneLevelDirList = () => {
    // 返回桌面和桌面一级目录
    const deskTop = path.resolve(os.homedir(),'Desktop');
    const ret = [pathItem(deskTop),...readDir(deskTop).filter(i =>requiredDir.includes(i.name))]
    return ret;
}
const twoLevelDirList = (oneLevelDirName) => {
    // 获取桌面或桌面一级目录下的目录
    const curDirName = oneLevelDirName === 'Desktop' ? 'Desktop' : `Desktop/${oneLevelDirName}`
    const twoLevelDir = path.resolve(os.homedir(),curDirName);
    const ret = [...readDir(twoLevelDir)]
    return ret;
}
const dirHelp = (dirList,fullPath = false) =>  {
    const formatRet = dirList.map((i)=>({
        '父目录':i.parentName,
        '项目名(可使用index指定)':i.name,
        ...(fullPath ? {'完整路径':i.path} : {})
    }))
    console.table(formatRet)
}
exports.getDirList = getDirList;
exports.dirHelp = dirHelp;
exports.getOneLevelDirList = oneLevelDirList;
exports.getTwoLevelDirList = twoLevelDirList;
