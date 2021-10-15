import {a} from './index.js'
const add = (x,y)=>{
    return x+y;
}
const config = {
    version:'1.0.0'
}
const testSameName ='indexVar';
const testNoUse ='';
console.log(a,testSameName)
export default config;
export {add,testNoUse}