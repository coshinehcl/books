const { program,Option,InvalidArgumentError } = require('commander');

function myParseInt(value, dummyPrevious) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}
function increaseVerbosity(dummyValue, previous) {
    return previous + 1;
}
function collect(value, previous) {
    return previous.concat([value]);
}
function commaSeparatedList(value, dummyPrevious) {
    return value.split(',');
}
// 传统方式配置
// program
//   .option('-i, --integer <number>', 'integer argument', myParseInt)
//   .option('-v, --verbose', 'verbosity that can be increased', increaseVerbosity, 0)
//   .option('-c, --collect <value>', 'repeatable value', collect, [])
//   .option('-l, --list <items>', 'comma separated list', commaSeparatedList)
// ;

// new 方式配置
program
  .addOption(new Option('-i, --integer <number>', 'integer argument').argParser(myParseInt))
  .addOption(new Option('-v, --verbose', 'verbosity that can be increased').argParser(increaseVerbosity).default(0,'默认值'))
  .addOption(new Option('-c, --collect <value>', 'repeatable value').argParser(collect).default([],'默认值'))
  .addOption(new Option('-l, --list <items>', 'comma separated list').argParser(commaSeparatedList))

program.parse();
const options = program.opts();
console.log(options)

// Try the following:
//    node options-custom-processing --integer 2
//    node options-custom-processing --list x,y,z
//    node options-custom-processing -v -v -v
//    node options-custom-processing -c a -c b -c c

