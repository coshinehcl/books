const { program } = require('commander');
// 测试pre、post
program
    .option('-t, --trace [arg1]', 'display trace statements for commands')
    .hook('preAction', (thisCommand, actionCommand) => {
        console.log('preAction1执行')
    })
    .hook('preAction', (thisCommand, actionCommand) => {
        console.log('preAction2执行')
    })
    .hook('postAction', (thisCommand, actionCommand) => {
        console.log('postAction执行')
    })
    .action(function(arg1,myOption,that){
        console.log('action执行')
    })
   .parse()


// 以下为测试形参

// const { Command } = require('commander');
// const myCommand = new Command('top')
// myCommand
//     .option('-t, --trace [arg1]', 'display trace statements for commands')
//     .hook('preAction', (thisCommand, actionCommand) => {
//         console.log('preAction1执行')
//         console.log(thisCommand.name(),actionCommand.name())
//     })
//     .hook('preAction', (thisCommand, actionCommand) => {
//         console.log('preAction2执行')
//     })
//     .hook('postAction', (thisCommand, actionCommand) => {
//         console.log('postAction执行')
//     })
//     .action(function(arg1,myOption,that){
//         console.log('action执行')
//     })
//     // 这边注册子命令
//     .command('clone <source> [destination]')
//     .description('clone a repository into a newly created directory')
//     .action((source, destination) => {
//         console.log('clone command called');
//     })
//    .parse()
