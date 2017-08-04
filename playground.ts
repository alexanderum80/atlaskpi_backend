import { SaleSchema } from './data/models/app/sales/Sale';
import * as mongoose from 'mongoose';
// import { testMongoosePerformance } from './playground/mongoose-performance';
// import { playWithUsers } from './playground/index';
// import { TestReportingProcessor } from './playground/reporting-processor';
// import { executeKpis } from './playground/execute-kpis';

// import { fillEmployeeHours } from './playground/time-tracking-simulator';
// import { fixEmployeesRoles } from './playground/fix-saltz-employee-roles';

// playWithUsers();

// TestReportingProcessor();
// testMongoosePerformance();

// executeKpis();

// fixEmployeesRoles();
// fillEmployeeHours();

function readMongooseSchema(schema: mongoose.Schema) {
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


let b = readMongooseSchema(SaleSchema);

console.log('done');