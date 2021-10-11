const { program,Option } = require('commander');
// new 方式配置选项
program.addOption(new Option('-s, --secret').hideHelp())
.addOption(new Option('-s, --secret').hideHelp())
.addOption(new Option('-t, --timeout <delay>', 'timeout in seconds').default(60, 'one minute'))
.addOption(new Option('-d, --drink <size>', 'drink cup size').choices(['small', 'medium', 'large']))
.addOption(new Option('-p, --port <number>', 'port number').env('PORT'))
// .addOption(new Option('-x, --xx <number>', 'port number').name())
.parse(process.argv)
console.log('Options: ', program.opts());
console.log(new Option('-d, --drink <size>', 'drink cup size').choices(['small', 'medium', 'large']))