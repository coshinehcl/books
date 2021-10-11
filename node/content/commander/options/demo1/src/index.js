const { program } = require('commander');
// boolen选项
program.option('-d, --debug', 'output extra debugging')
// 带参数选项
program.option('-p, --pizza-type <type>', 'flavour of pizza')
// 可选参数选项
.option('-c, --cheese [type]', 'Add cheese with optional type')
.parse(process.argv)
const options = program.opts();
console.log(options)


