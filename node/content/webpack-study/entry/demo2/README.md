# entry的对象格式

## 1、entry

字符串配置
entry:'./src/index.js'
=>
entry:{
    main:'./src/index.js'
}
或
entry:{
    main:{
        import:'./src/index.js'
    }
}

数组配置：
entry:['./src/index.js','./src/index1.js']
=>
entry:{
    main:['./src/index.js','./src/index1.js']
}
或
entry:{
    main:{
        import:['./src/index.js','./src/index1.js']
    }
}

// 理解：可以理解为上面是简化版或者简易版

## 2、depenOn

entry:{
    main:{
        import:'./src/index.js',
        depenOn:'index'
        depenOn:['index','index1']
    },
    index:'./src/index.js',
    index1:'./src/index1.js'
}

## 3、懒加载相关：layer和chunkLoading
