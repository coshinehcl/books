const { program } = require('commander');
program.version('1.2.3','-v1, --ver', '这里是版本描述')
.parse(process.argv)