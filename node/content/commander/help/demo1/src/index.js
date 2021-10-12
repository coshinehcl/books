const { program} = require('commander');

// 测试手动敲console
const test1 = ()=>{
    program
    .description('An application for pizza ordering')
    .option('-p, --peppers', 'Add peppers')
    .option('-c, --cheese <type>', 'Add the specified type of cheese', 'marble')
    .option('-C, --no-cheese', 'You do not want any cheese');

    program.parse();

    const options = program.opts();
    console.log('you ordered a pizza with:');
    if (options.peppers) console.log('  - peppers');
    const cheese = !options.cheese ? 'no' : options.cheese;
    console.log('  - %s cheese', cheese);
}
// test1()

// 测试addHelpText
const test2 = ()=>{
    program
        .option('-f, --foo', 'enable some foo')
        .addHelpText('after',`测试\n换行`)
        .addHelpText('after',()=>{
            return '测试函数'
        })
        .addHelpText('after',(context)=>{
            // context：{ error: context.error, command: context.command }
            return '测试参数'+(context.command === program)
        })
        .parse()
}
// test2()

// 测试showHelpAfterError
const test3 = ()=>{
    program
        .option('-f, --foo', 'enable some foo')
        // .showHelpAfterError(false) // true / false测试下
        .showHelpAfterError('add --help for additional information')
        .parse()
}
test3()