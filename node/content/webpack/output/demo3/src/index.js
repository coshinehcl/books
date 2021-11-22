console.log('index');
window.webpackChunk = 'hcl'
setTimeout(() => {
    import('./other.js').then(res => {
        console.log('加载成功',res)
    }) 
}, 0);
