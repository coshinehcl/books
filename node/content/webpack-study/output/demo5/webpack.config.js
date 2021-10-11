module.exports = {
    mode:'none',
    output:{
        assetModuleFilename:'xx[ext][query]'
    },
    module:{
        rules:[
            {
                test:/.png$/i,
                type: 'asset/resource',
            }
        ]
    }
}