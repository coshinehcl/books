#!/usr/bin/env node
const { program } = require('commander');
const ls = require('./ls/lib');
const cd = require('./cd/lib');
const open = require('./open/lib');
const code = require('./code/lib');
const git = require('./git/lib');
const {getDirList,dirHelp} = require('../utils');
const package = require('../package.json');

const dirList = getDirList()
program
.version(package.version,'-v,--version','版本号')
.addCommand(ls,{isDefault:true})
// .addCommand(cd)
// .addCommand(open)
// .addCommand(code)
// .addCommand(git)
.parseAsync()

/**
 * 这里是默认的帮助信息，也就是列出所有的目录
 */
//  dirHelp(dirList);