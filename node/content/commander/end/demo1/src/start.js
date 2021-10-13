#!/usr/bin/env node
const { program } = require("commander");
const ls = require("./ls/lib");
const cd = require("./cd/lib");
const open = require("./open/lib");
const code = require("./code/lib");
const git = require("./git/lib");
const package = require("../package.json");
const clc = require("cli-color");
const { getDate,getUserInfo,getTang } = require('../utils')

program
  .version(package.version, "-v,--version", "版本号")
  .hook('preAction', async (thisCommand, actionCommand) => {
    const tang = await getTang();
    const tangContent = tang;
    const curRandom = Math.random();
    console.table({
      '🤪':{},
      'Welcome':{
        '用户':getUserInfo().username,
        "日期":getDate(),
        "～":tang.contentOneLine
      },
      "":{
        // 偶尔显示title和auther
        ...(
          curRandom >0.6 ? (
            curRandom >0.7 ? {"～":tang.title} : {"～":tang.author}
          ) :
          {}
        )
      }
    })
  })
  .addCommand(ls, { isDefault: true })
  // .addCommand(cd)
  // .addCommand(open)
  // .addCommand(code)
  // .addCommand(git)
  .parseAsync();

/**
 * 这里是默认的帮助信息，也就是列出所有的目录
 */
//  dirHelp(dirList);
