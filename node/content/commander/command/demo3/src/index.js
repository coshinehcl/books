
const { program,Command,addCommand } = require('commander');
const path = require('path')

// 测试 isDefault、hidden
// program
// .command('login <username> [password]',{hidden:true})
// .action(()=>{
//     console.log('登录')
// })

// program
// .command('logout',{isDefault:true})
// .action(()=>{
//     console.log('登出')
// })

// program
// .command('other')
// .action(()=>{
//     console.log('其它')
// })

// 测试executableFile
program.command('login <arg1>', 'login描述',{executableFile:path.resolve(__dirname,'loginxx.js')})
program.command('logout <agr1>', 'logout描述',{executableFile:path.resolve(__dirname,'logoutyy.js'),isDefault:true})
program.command('other <agr1>', 'other描述',{executableFile:path.resolve(__dirname,'otherzz.js')})

program.parse()
