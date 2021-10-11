const Router = require('koa-router')
const fs = require('fs')
const path = require('path')
const child_process = require('child_process');
const URL=require('url');
const mime = require('mime-types');
const getContentPath = (key) => {
    const relativePath = key.split('.').join('/');
    return path.resolve('./node',`content/${relativePath}`)
}
const getImgPath = (url) => {
    return path.resolve('./node',`.${url.slice(url.indexOf('/img'))}`)
}
// 格式化内容
const formatContentData = (data,key) => {
    // ![avatar](**/1.png)，替换为当前服务
    let _data = data.replace(new RegExp(/!\[avatar\]\(/,'g'),'![avatar]('+`http://localhost:${currentPORT}/img/`);
    // 添加最后访问时间
    try {
        const readDetail = fs.readFileSync(path.resolve(__dirname,'../sql/readDetail.json'));
        const parseReadDetail = JSON.parse(readDetail.toString() || '{}');
        if(parseReadDetail[key]) {
            _data +='\n\n\n'+ '最后访问时间：' + parseReadDetail[key].updateTime;
            _data+='\n' + '访问量：' + parseReadDetail[key].visitTimes
        }
    } catch(err){}
    return _data
}
const currentPORT = 3333

// 目录
const router = new Router()
router.get('/getMenu', async (ctx, next) => {
    const {list,updateMenuList, activeKey} = require('./createMenu')
    updateMenuList();
    ctx.body = {
        list,
        activeKey
    }
})

// 获取内容
router.get('/getContent', async (ctx, next) => {
    if(ctx.query.key) {
        try {
            const data =fs.readFileSync(`${getContentPath(ctx.query.key)}/README.md`,'utf-8')
            const formatData = formatContentData(data,ctx.query.key)
             ctx.body = formatData
            addRecord(ctx.query.key,formatData)
        } catch(res){
            ctx.body = 'key不对' + res
        }
    } else {
        ctx.body = '请带上key'
    }
})

// 执行命令：打开
router.get('/open', async (ctx, next) => {
    if(ctx.query.key) {
        try {
            child_process.spawn('code',[getContentPath(ctx.query.key)])
            ctx.body = 'success'
        } catch(res){
            ctx.body = '目录不对' + res
        }
    } else {
        ctx.body = '请带上key'
    }
})

// 获取图片
router.get(/^\/img/,async(ctx)=>{
    try {
        const filePath = getImgPath(decodeURI(ctx.url))
        const data = fs.readFileSync(filePath); //读取文件
        ctx.set('content-type', mime.lookup(filePath));
        ctx.body = data
    } catch(err){
        ctx.body = '图片地址不正确'
    }
   
})


router.get('/error', async (ctx, next) => {
ctx.body = '你好，我这里是error页'
})

function addRecord(queryKey,content){
    // 只允许一个并行，防止读写出错
    if(addRecord.writeNum) {
        console.warn('正在记录，不允许并行')
        return;
    };
    const key = queryKey.split('.')[0];
    // 更新总记录,一级目录
    try {
        // 读
        const data = fs.readFileSync(path.resolve(__dirname,'../sql/readStar.json'));
        // 更新
        const dataParse = JSON.parse(data.toString() || '{}');
        if(dataParse[key]) {
            dataParse[key] +=1;
        } else {
            dataParse[key] = 1;
        }
        dataParse.updateTime = new Date().toJSON()
        // 写入
        addRecord.writeNum = (addRecord.writeNum|| 0) + 1;
        fs.writeFile(path.resolve(__dirname,'../sql/readStar.json'),JSON.stringify(dataParse,null,2),function(err){
            addRecord.writeNum--;
        })
    } catch(err) {
        console.log(err)
    }
    // 更新每天的记录,一级目录
    try {
        // 读
        const data = fs.readFileSync(path.resolve(__dirname,'../sql/dayRead.json'));
        // 更新
        const dataParse = JSON.parse(data.toString() || '{}');
        const today =  new Date().getFullYear() + '-' + new Date().getMonth() + '-' + new Date().getDate()
        if(!dataParse[today]) {
            dataParse[today] = {
                [key]:1
            };
        } else {
            dataParse[today]= {
                ...dataParse[today],
                [key]:(dataParse[today][key] || 0) + 1
            }
        }
        dataParse[today].updateTime = new Date().toJSON()
        // 写入
        addRecord.writeNum = (addRecord.writeNum|| 0) + 1;
        fs.writeFile(path.resolve(__dirname,'../sql/dayRead.json'),JSON.stringify(dataParse,null,2),function(err){
            addRecord.writeNum--;
        })
    } catch(err) {
        console.log(err)
    }
    // 更新每个item的详细记录
    try {
        // 读
        const data = fs.readFileSync(path.resolve(__dirname,'../sql/readDetail.json'));
        // 更新
        const dataParse = JSON.parse(data.toString() || '{}');
        const contentDesc =(content || '').split('\n')[0].replace(/^#/,'').trim();
        dataParse[queryKey] = {
            visitTimes:((dataParse[queryKey] || {}).visitTimes || 0) + 1,
            updateTime:new Date().toJSON(),
            desc:contentDesc
        }
        // 写入
        addRecord.writeNum = (addRecord.writeNum|| 0) + 1;
        fs.writeFile(path.resolve(__dirname,'../sql/readDetail.json'),JSON.stringify(dataParse,null,2),function(err){
            addRecord.writeNum--;
        })
    } catch(err) {
        console.log(err)
    }
}
module.exports = router
