export function field(definition?: any) {
    return function(target, property) {
        console.log(JSON.stringify(definition));

        if (!target.___metadata___) {
            target.___metadata___ = {};
        }

        if (!target.___metadata___.fields) {
            target.___metadata___.fields = {};
        }

        const fields = target.___metadata___.fields;

        if (fields[property]) {
            throw new Error('A property with the same name was already defined on: ' + target.constructor.name);
        }

        fields[property] = {
            type: definition.type
        };

        return null;
    };
}