function test(x,y){
    const x1 = 1;
    console.log(process.env.NODE_ENV)
    return x + y;
}
const b  = 2;
const c = test(2,3);
console.log(c)
