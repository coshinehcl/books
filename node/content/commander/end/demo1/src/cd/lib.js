const package = require('../../package.json')
const { Command } = require('commander');
const myCommand = new Command('cd');
const {getDirList,dirHelp,currentDitList} = require('../../utils')

myCommand
.version(package.version,'-v,--version','版本号')
.description('打开指定的目录')
.argument('[path]','项目名称或路径')
.action((path)=>{
   console.log('currentDitList',currentDitList)
})
module.exports = myCommand