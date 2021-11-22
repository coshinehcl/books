#!/usr/bin/env node
const { program } = require('commander');
const clc = require("cli-color");
const path = require('path');
const fs = require('fs');
const child_process = require("child_process");
const prompts = require("prompts");
const ProgressBar = require('progress');

/**
 * 确认需要的目录有没有错
 */
const confirmQuestion = async(msg) => {
    const response = await prompts({
        type: "confirm",
        name: "confirm",
        message: msg,
      });
    return response.confirm
}
/**
 * README.md内容模板
 */
const readMeTemplate = (parentDirName) => {
    return `# ${parentDirName}\n\n## 一、介绍\n\n## 二、测试\n\n## 三、总结`
}
/**
 * code打开books
 */
const openBooks = (contentDir,autoOpen)=>{
    const bookDir = path.resolve(contentDir,'../../');
    if(autoOpen){
        console.log('自动打开books',clc.yellowBright(bookDir))
    }
    child_process.spawn('code',[bookDir])
}

program
.version(require('../package.json').version,'-v,--version','version')
.option('-n,--number [num]','创建demo个数',2)
.option('-o,--open','code打开books')
.option('-d,--demo [num]','新增demo,格式为vue reactive 4,代表需要生成4个demo')
.argument('[dir...]','目录字符串，格式为：第一个是父目录名,后续为子目录名')
.description('自动创建books目录,支持原有基础上添加,已有目录则忽略添加')
.showHelpAfterError()
.action(async (dirList,options)=>{
    const contentDir = path.resolve(__dirname,'../../../../');
    console.log('ok')
    if(!dirList.length && !options.demo) {
        if(options.open) {
            openBooks(contentDir,options.open)
        }
    } else if(options.demo){
        console.log('com')
        let demoNum = parseInt(options.demo) || 1;
        
        let parentDirName = dirList[0];
        let childDirName =  dirList[1];
        
        if(dirList.length < 2) {
            // 支持获取当前路径,需要在content环境内
            const cwd = process.cwd().split('/');
            const contentIndex = cwd.findIndex(i => i === 'content')
            parentDirName = cwd[contentIndex + 1];
            childDirName =  cwd[contentIndex + 2];
            if(!parentDirName || !childDirName) {
                return console.log('创建demo需要在该二级目录下')
            }
        }
        
        const parentDir = path.resolve(contentDir,parentDirName);
        const childDir =  path.resolve(parentDir,childDirName);
        // 信息展示
        console.log('操作目录：',childDir)
        console.log('新增demo数：',demoNum)
        // 信息确认
        const isConfirm = await confirmQuestion('确认以上信息是否正确');

        if(isConfirm) {
            if(!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir)
                // 一级目录下，需要一个home来做导读
                fs.mkdirSync(path.resolve(parentDir,'home'))
                fs.writeFile(path.resolve(parentDir,'home/README.md'),readMeTemplate(`home`),()=>{});
                // 添加end
                fs.mkdirSync(path.resolve(parentDir,'end'))
                fs.writeFile(path.resolve(parentDir,'end/README.md'),readMeTemplate(`end`),()=>{});
            }
            if(!fs.existsSync(childDir)) {
                fs.mkdirSync(childDir)
            }
            // 创建demo
            const alreadyDemoNum = fs.readdirSync(childDir).reduce((total,cur) => {
                const location = path.join(childDir,cur)
                const info = fs.statSync(location)
                if(info.isDirectory() && cur.includes('demo')){
                    total+=1;
                }
                return total
            },0)
            console.log('已经存在demo数：',alreadyDemoNum)
            new Array(demoNum).fill('').forEach((i,index) => {
                const name = `demo${index+1 + alreadyDemoNum}`;
                const demoDir = path.resolve(childDir,name);
                fs.mkdirSync(demoDir);
                // 每个demo下，创建src/index.js和README.md
                fs.mkdirSync(path.resolve(demoDir,'src'));
                fs.writeFile(path.resolve(demoDir,'src/index.js'),'',()=>{})
                fs.writeFile(path.resolve(demoDir,'README.md'),readMeTemplate(name),()=>{});
            })
            console.log('创建成功')
        }
    }else {
        let demoNum = parseInt(options.number);
        const parentDir = path.resolve(contentDir,dirList[0]);
        const childDirList = dirList.slice(1).map(i => path.resolve(parentDir,i));
        // 校验输入
        if(isNaN(demoNum)) {
            return console.error(clc.redBright('demo个数必须是Int'),`你输入的是${options.number}`);
        }
        if(dirList.slice(1).includes('end')) {
            return console.log('会自动创建end目录，不需要手动添加进来')
        }
              
        // 信息展示
        console.log('创建demo数为：',clc.yellowBright(demoNum))
        if(childDirList.length) {
            console.log('创建目录为：')
            console.table(childDirList.map((i,index) =>({
                ...(!index ? {'父目录':dirList[0]} : {}),
                '子目录名':i.split('/').slice(-1)[0],
                '子目录路径':i
            })))
        } else {
            console.log('创建目录为：',clc.blueBright(dirList[0]))
            console.log('路径：',clc.yellowBright(parentDir))
        }
        
        // 信息确认
        const isConfirm = await confirmQuestion('确认以上信息是否正确');
        if(!isConfirm) return;

        // 开启进度条，进度条为用户感知的创建目录数，自动额外创建的不计算在内
        // 这里width取最大值，因为源码：var width = Math.min(this.width, availableSpace);
        const bar = new ProgressBar(':bar :current/:total :elapsed', { total: dirList.length,width:10000,complete:'*' });
        if(!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir)
            // 一级目录下，需要一个home来做导读
            fs.mkdirSync(path.resolve(parentDir,'home'))
            fs.writeFile(path.resolve(parentDir,'home/README.md'),readMeTemplate(`home`),()=>{});
        } else {
            console.warn(clc.yellowBright(`${parentDir}目录已经存在`))
        }
        bar.tick()

        // 自动添加end
        ;([path.resolve(parentDir,'end'),...childDirList]).forEach((childDir,index) => {
            if(!fs.existsSync(childDir)) {
                fs.mkdirSync(childDir)
                // 并且创建多个demo
                new Array(demoNum).fill('').forEach((i,index) => {
                    const demoDir = path.resolve(childDir,`demo${index+1}`);
                    fs.mkdirSync(demoDir);
                    // 每个demo下，创建src/index.js和README.md
                    fs.mkdirSync(path.resolve(demoDir,'src'));
                    fs.writeFile(path.resolve(demoDir,'src/index.js'),'',()=>{})
                    fs.writeFile(path.resolve(demoDir,'README.md'),readMeTemplate(`demo${index+1}`),()=>{});
                })
            } else {
                console.warn(clc.yellowBright(`${childDir}目录已经存在`))
            }
            if(index){
                // 除了end
                bar.tick()
            }
        })

        console.log(clc.yellowBright('已完成'))
        // 打开books
        if(options.open) {
            openBooks(contentDir,options.open)
        } else {
            const isCodeOpen = await confirmQuestion('是否code打开books');
            if(isCodeOpen) {
                openBooks(contentDir,options.open)
            }
        }
    }
})
.parseAsync()
