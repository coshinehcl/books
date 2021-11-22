const path = require('path')
function loader(source){
    this.dependency(this.context)
    console.log(this.context)
    this.emitFile('hh','asda')
    this.emitWarning('warn')
    return `
    const pngUrl = new URL('./1.png',import.meta.url);\n
    import './other.js'
    export default ''
    `
}


// Imports

// import ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___ from "../node_modules/css-loader/dist/runtime/noSourceMaps.js";
// import ___CSS_LOADER_API_IMPORT___ from "../node_modules/css-loader/dist/runtime/api.js";
// import ___CSS_LOADER_GET_URL_IMPORT___ from "../node_modules/css-loader/dist/runtime/getUrl.js";
// var ___CSS_LOADER_URL_IMPORT_0___ = new URL("./1.png", import.meta.url);

// Module
// 
// var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);
// var ___CSS_LOADER_URL_REPLACEMENT_0___ = ___CSS_LOADER_GET_URL_IMPORT___(___CSS_LOADER_URL_IMPORT_0___);
// ___CSS_LOADER_EXPORT___.push([module.id, ".red {\\n    color:red\\n}\\n.bg {\\n    background: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\\n}", ""]);\n'
// 

// Exports
// export default ___CSS_LOADER_EXPORT___;


module.exports = loader