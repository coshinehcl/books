
const { program,Command,addCommand } = require('commander');

// 方式一
const test1 = (myCommand)=>{
    myCommand
    .command('login <username> [password]')
    .description('登录')
    .action((name, pwd) => {
        console.log('login')
        console.log('username:', name);
        console.log('password:', pwd);
    })
    myCommand
    .command('logout')
    .description('登出')
    .action(() => {
        console.log('logout')
    }) 
    // 这边直接是解析顶层命令，不要在子命令后面解析，这样解析的是子命令。
    return myCommand;
}

// 方式二、addCommand的方式
const test2 = () => {
    const myCommand = new Command();
    // 子命令本身的name,描述和命令参数
    const childComand = new Command('child').description('child描述').argument('[子命令]', 'child参数')
    myCommand.addCommand(test1(childComand))
    return myCommand;
}

// 方式三、通过独立的的可执行文件实现命令
// 此时，需要
const test3 = () => {
    const myCommand = new Command('hh')
    myCommand
    .command('login <username> [password]','登录')
    .command('logout','登出')
    return myCommand
}

// 测试完整结构（顶层命令其实也应该有描述的，其它可选。及后面注册子命令）
const test4 = () => {
    program
    // 顶层命令的描述、命令参数、选项、action注册
    .description('这个是顶层命令的描述')
    .option('-d, --debug', 'output extra debugging')
    // .option('-d, --debug [type...]', 'output extra debugging')
    .argument('<arg1>', '顶层命令参数1')
    .argument('[arg2]', '顶层命令参数2')
    // .argument('[login]', '顶层命令参数2')
    .action(function(source, destination){
      console.log('顶层命令 called',this.opts(),source, destination);
    })
    // 注册子命令
    .command('login <username> [password]')
    .description('登录')
    .action((name, pwd) => {
      console.log('login')
      console.log('username:', name);
      console.log('password:', pwd);
    })
      return program
}

// 测试

// 测试test1
// const myCommand = test1(program);

// 测试test2
const myCommand = test4();
console.log(myCommand)
myCommand.parse()



