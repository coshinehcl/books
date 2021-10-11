module.exports = {
    mode:'none',
    // output:{
    //     // 默认false,为true可以增加一个命名空间,避免全局污染
    //     iife:false
    // }
    // output:{
    //     clean:true
    // }
    // clean 对象形式
    // dry分析
    // output:{
    //     clean:{
    //         dry: true
    //     }
    // }
    // keep分析
    output:{
        clean:{
            // 理解：也就是正则匹配文件名，符合的留下，不符合的删除
            // keep: /ignored\/dir\//, // Keep these assets under 'ignored/dir'.
            keep(asset) {
                // 输出文件名称
                console.log(asset);
                return asset.includes('1');
            },
        },
        compareBeforeEmit:true
    }
}