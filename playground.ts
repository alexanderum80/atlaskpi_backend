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

// function readMongooseSchema(schema: mongoose.Schema) {
//     let result = {};
//     let keys: string[];
//     let schemaObj = {};
//     const objConstructor = schema.constructor.name;

//     if (objConstructor === 'Schema') {
//         schemaObj = schema.obj;
//     } else if (objConstructor === 'Array') {
//         schemaObj = schema[0].obj;
//     } else {
//         schemaObj = schema;
//     }

//     keys = Object.keys(schemaObj);

//     if (keys.indexOf('unique') !== -1) {
//         return schemaObj['type'].name;
//     }

//     keys.forEach(k => {
//         const constructorName = schemaObj[k].constructor.name;
//         const functionName = schemaObj[k].name;

//         result[k] = ['Object', 'Array', 'Schema'].indexOf(constructorName) !== -1 ?
//             readMongooseSchema(schemaObj[k]) : functionName;
//     });

//     return result;
// }


// let b = readMongooseSchema(SaleSchema);

// console.log('done');
import * as request from 'request';
import { IAccountDBUser } from './data/models/master';
import { config } from './config';

function createAccountDbUser(accountDbUser: IAccountDBUser, config): Promise<boolean> {
    let body = {
        databaseName: 'admin',
        roles: accountDbUser.roles,
        username: accountDbUser.user,
        password: accountDbUser.pwd
    };

    let options: request.Options = {
        uri: config.mongoDBAtlasCredentials.uri,
        auth: {
            user: config.mongoDBAtlasCredentials.username,
            pass: config.mongoDBAtlasCredentials.api_key,
            sendImmediately: false
        },
        json: body
    };

    // curl -u "orlando@atlaskpi.com:16626d64-e21d-4208-b9b0-02a07020e6b7" --digest -i "https://cloud.mongodb.com/api/atlas/v1.0?pretty=true"
    return new Promise<boolean>((resolve, reject) => {
        request.post(options, function(error, response, body) {
            if (!error) {
                console.log('User created...');
                resolve(true);
            } else {
                // console.log('Code : ' + response.statusCode);
                // console.log('error : ' + error);
                // console.log('body : ' + body);
                console.log('Error creating db user: ' + error);
                reject(false);
            }
        });
    });

}

createAccountDbUser({
    user: 'user1',
    pwd: 'PassWORD01$',
    roles: [
        { roleName: 'dbAdmin', databaseName: 'master' },
        { roleName: 'readWrite', databaseName: 'master' }
    ]
 }, config);