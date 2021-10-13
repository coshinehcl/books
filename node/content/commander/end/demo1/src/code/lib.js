const package = require('../../package.json')
const { Command } = require('commander');
const myCommand = new Command('code');

myCommand
.version(package.version,'-v,--version','版本号')
module.exports = myCommand