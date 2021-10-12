const { program} = require('commander');

async function main() {
  program
    .command('run')
    .action(async function(){
        console.log('进入action',new Date().getSeconds())
        await new Promise((resolve)=>{
            setTimeout(() => {
                console.log('执行完action',new Date().getSeconds())
                resolve()
            }, 2000);
        })
        console.log('action end')
    });
  console.log('开始解析',new Date().getSeconds())
  await program.parseAsync();
  console.log('解析end',new Date().getSeconds())
}
main()