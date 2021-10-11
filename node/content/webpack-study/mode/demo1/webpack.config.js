// module.exports = {
//     // 'none' | 'development' | 'production'
//     // mode:'none',
//     mode:'development'
// }

module.exports = (env, argv) => {
    console.log(env,argv)
    console.log(process.env.hcl)
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(
                {
                    mode:'none'
                }
            )
        }, 4000);
    })
}
