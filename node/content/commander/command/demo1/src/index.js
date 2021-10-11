const { program } = require('commander');

program
  .command('clone <source> [destination]')
  .description('clone a repository into a newly created directory')
  .action((source, destination) => {
    console.log('clone command called');
  })
  .command('clone1 <source> [destination]')
  .description('clone1 a repository into a newly created directory')
  .action((source, destination) => {
    console.log('clone1 command called');
  })
.parse(process.argv)
const options = program.opts();
console.log(options)


