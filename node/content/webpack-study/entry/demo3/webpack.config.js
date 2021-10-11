module.exports = {
    mode:'none',
    // 1、函数形式
    // entry:()=>'./src/index.js'
    // 2、promise
    // entry:()=>new Promise((resolve)=>{
    //     setTimeout(() => {
    //         resolve('./src/index.js')
    //     }, 4000);
    // })
    // 3、promise和对象格式
    entry:()=>new Promise((resolve)=>{
        setTimeout(() => {
            resolve({
                main:{
                    import:'./src/index.js'
                }
            })
        }, 4000);
    })
}