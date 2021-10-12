const { program,Argument, } = require('commander');

console.log(new Argument('[arg1]','描述1'))
program
.addArgument(new Argument('[arg1]','描述1'))
.addArgument(new Argument('[arg2...]','描述2').default(20,'默认值描述'))
.parse(process.argv)

