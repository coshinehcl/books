const path = require('path');
let a = decodeURI('http://localhost:3333/img/babel%E8%AF%AD%E6%B3%95%E5%88%86%E6%9E%90.png')
console.log(a)
const t = path.resolve('./node',`content/${a.slice(a.indexOf('/img'))}`)
console.log(t)