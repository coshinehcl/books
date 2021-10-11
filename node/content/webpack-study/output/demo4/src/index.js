
console.log('index')
import('./module/1.js').then(res => {
    console.log(res(1,2))
})
