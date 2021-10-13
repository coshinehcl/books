const package = require('../../package.json')
const { Command } = require('commander');
const myCommand = new Command('open');

myCommand
.version(package.version,'-v,--version','版本号')
.description('打开指定的项目')
.argument('[path]','项目名称或路径')
module.exports = myCommand