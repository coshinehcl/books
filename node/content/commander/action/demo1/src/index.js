const { program,Argument} = require('commander');

program
.version('1.2.3','-v1, --ver', '这里是版本描述')
.option('-d, --debug', 'output extra debugging')
// 带参数选项
.option('-p, --pizza-type <type>', 'flavour of pizza')
// 可选参数选项
.option('-c, --cheese [type]', 'Add cheese with optional type')
// 命令参数
.addArgument(new Argument('[arg1]','描述1'))
.addArgument(new Argument('[arg2...]','描述2').default(20,'默认值描述'))
.action(function(arg1,arg2List,myOption,that){
    console.log(arg1,arg2List)
    console.log(myOption,myOption === program.opts(),that === program)
})
.parse(process.argv)

