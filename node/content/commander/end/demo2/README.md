# 作业2

## 一、作业要求
```js
// 创建一个用于快速创建books目录的脚手架，即给定目录和子目录，能够创建好符合规范的目录结构
// 并把做好的命令行工具，添加到环境变量中，在命令行中直接敲该指令，即可快速实现上诉要求

// 1、规范目录结构
// 2、规范一级目录下需要home和README.md的内容
// 3、同时满足，快速打开books
```

## 二、代码
```js
```js
// 创建一个用于快速创建books目录的脚手架，即给定目录和子目录，能够创建好符合规范的目录结构
// 并把做好的命令行工具，添加到环境变量中，在命令行中直接敲该指令，即可快速实现上诉要求

// 1、规范目录结构
// 2、规范一级目录下需要home和README.md的内容
```

## 二、代码
```js
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
.argument('[dir...]','目录字符串，格式为：第一个是父目录名,后续为子目录名')
.description('自动创建books目录,支持原有基础上添加,已有目录则忽略添加')
.showHelpAfterError()
.action(async (dirList,options)=>{
    const contentDir = path.resolve(__dirname,'../../../../');
    if(!dirList.length) {
        if(options.open) {
            openBooks(contentDir,options.open)
        }
    } else {
        let demoNum = parseInt(options.number);
        const parentDir = path.resolve(contentDir,dirList[0]);
        // 自动添加end目录
        if(dirList.slice(1).includes('end')) {
            return console.log('会自动创建end目录，不需要手动添加进来')
        }
        const childDirList = [...dirList.slice(1),'end'].map(i => path.resolve(parentDir,i));

        // 校验输入
        if(isNaN(demoNum)) {
            return console.error(clc.redBright('demo个数必须是Int'),`你输入的是${options.number}`);
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

        childDirList.forEach(childDir => {
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
            bar.tick()
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

```

## 三、效果
![avatar](command_demo2_1.png)
![avatar](command_demo2_2.png)
![avatar](command_demo2_3.png)