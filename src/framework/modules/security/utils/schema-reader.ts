import * as mongoose from 'mongoose';

export function readMongooseSchema(schema: mongoose.Schema) {
    let result = {};
    let keys: string[];
    let schemaObj = {};
    const objConstructor = schema.constructor.name;

    if (objConstructor === 'Schema') {
        schemaObj = schema.obj;
    } else if (objConstructor === 'Array') {
        schemaObj = schema[0].obj;
    } else {
        schemaObj = schema;
    }

    keys = Object.keys(schemaObj);

    if (keys.indexOf('unique') !== -1) {
        return schemaObj['type'].name;
    }

    keys.forEach(k => {
        const constructorName = schemaObj[k].constructor.name;
        const functionName = schemaObj[k].name;

        result[k] = ['Object', 'Array', 'Schema'].indexOf(constructorName) !== -1 ?
            readMongooseSchema(schemaObj[k]) : functionName;
    });

    return result;
}