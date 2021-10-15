import index from './index.js'
const add = (x,y)=>{
    return x+y;
}
const config = {
    version:'1.0.0'
}
const testSameName ='indexVar';
const testNoUse ='';
console.log(index,testSameName)
export default config;
export {add,testNoUse}