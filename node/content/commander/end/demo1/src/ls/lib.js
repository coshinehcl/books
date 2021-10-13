const package = require("../../package.json");
const { Command } = require("commander");
const myCommand = new Command("ls");
const prompts = require("prompts");
const child_process = require("child_process");
const { getDirList,getOneLevelDirList, getTwoLevelDirList, dirHelp } = require("../../utils");
let curPathfullPath = "";

/**
 * 获取一级目录
 */
const oneLevel = async (oneLevelDirName) => {
        const oneLevelDirList = getOneLevelDirList();
        if (!oneLevelDirName || !oneLevelDirList.includes(oneLevelDirName)) {
          ({ path: oneLevelDirName } = await prompts({
            type: "select",
            name: "path",
            message: "选择一级目录，默认DeskTop",
            choices: [
              ...oneLevelDirList.map((i) => ({
                title: i.name,
                value: i.name,
              })),
              {
                  title:'退出',
                  value:''
              }
            ],
          }));
        }
        return oneLevelDirName;
}

/**
 * 获取二级目录
 */
const twoLevel = async (oneLevelDirName)=>{
        let twoLevelDirName = '';
        const twoLevelDirList = getTwoLevelDirList(oneLevelDirName);
        ({ path: twoLevelDirName } = await prompts({
          type: "select",
          name: "path",
          message: "选择二级目录，默认当前所有",
          onRender(kleur) {
            this.msg = kleur.cyan(`选择${oneLevelDirName}下的二级目录`);
          },
          choices: [
            { title:'所有',value:'__all' },
            ...twoLevelDirList.map((i) => ({
              title: i.name,
              value: i.name,
            })),
            { title:'回退',value:'__back' },
            { title:'退出',value:'' }
          ],
        }));
        return twoLevelDirName
}
/**
 * do
 */
const myAction = async ()=>{
  const response = await prompts({
    type: "select",
    name: "command",
    message: "选择某个命令",
    choices: [
      ...['code','open'].map(i =>({
        title:i,
        value:i
      })),
      { title:'回退',value:'__back' },
      { title:'退出',value:'' },
    ],
  });
  return response.command
}

myCommand
  .version(package.version, "-v,--version", "版本号")
  .description("查看所有的目录或查看指定父目录下的目录")
  .argument("[path]", "项目名称或路径")
  .action(async (oneLevelDirName) => {
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
module.exports = myCommand;
