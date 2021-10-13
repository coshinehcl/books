# 作业1

## 一、作业要求

```js
// 满足日常，选择某个目录，并执行code / open等操作
// 并把做好的命令行工具，添加到环境变量中，在命令行中直接敲该指令，即可快速实现上诉要求
```

## 二、部分代码
```js
myCommand
  .version(package.version, "-v,--version", "版本号")
  .description("查看所有的目录或查看指定父目录下的目录")
  .argument("[path]", "项目名称或路径")
  .option('-a,--all','获取所有的目录，并且用table来展示')
  .action(async (oneLevelDirName,options) => {
    if(options.all) {
      dirHelp(getDirList())
      return;
    }
    let doOneLevel = true;
    let _oneLevelDirName = ''
    do {
      if(doOneLevel) {
         // 获取一级目录
        _oneLevelDirName = await oneLevel(oneLevelDirName);
        if(!_oneLevelDirName) break;
      }
      // 获取二级目录
      doOneLevel = true;
      let twoLevelDirName = await twoLevel(_oneLevelDirName);
      if(twoLevelDirName === '__back') {
        continue;
      } else if(twoLevelDirName === '') {
        break;
      } else if(twoLevelDirName === '__all') {
        // 这里注意顺序
        twoLevelDirName = ''
      }
      // 执行某个命令
      const selectCommand = await myAction()
      if(selectCommand === '__back') {
        doOneLevel = false;
        continue;
      } else if(selectCommand === '') {
        break;
      } else {
        console.log(_oneLevelDirName,twoLevelDirName)
        let curDirPath = ''
        if(twoLevelDirName) {
          curDirPath = getTwoLevelDirList(_oneLevelDirName).find(i => i.name === twoLevelDirName).path
        } else {
          curDirPath = getOneLevelDirList(_oneLevelDirName).find(i => i.name === _oneLevelDirName).path
        }
        child_process.spawn(selectCommand,[curDirPath])
        break;
      }
    } while (true);
  });
```
## 三、效果

![avatar](command_demo1_1.png)
![avatar](command_demo1_2.png)
![avatar](command_demo1_3.png)
![avatar](command_demo1_4.png)