export function getType(v) {
    let type = Object.prototype.toString.call(v);
    type = type.split(" ")[1].slice(0, -1);
    return Object.is(v, NaN) ? "nan" : type.toLowerCase();
}
console.log('filters')