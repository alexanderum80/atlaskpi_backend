export function type(definition?: any) {
    return function(target) {
        console.log(JSON.stringify(target));
    };
}