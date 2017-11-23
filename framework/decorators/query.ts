export function query(definition: any) {
    return (target) => {
        console.log(definition.name);
        console.log(JSON.stringify(definition.input.constructor()));
    };
}
