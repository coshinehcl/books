const { program } = require('commander');
// boolen选项
program.option('-d, --debug', 'output extra debugging',123)
// 带参数选项
program.option('-p, --pizza-type <type...>', 'flavour of pizza',123)
// 可选参数选项
program.option('-c, --cheese [type...]', 'Add cheese with optional type',123)
.parse(process.argv)
const options = program.opts();
console.log(options)