import { DateRangeHelper } from './data/queries/app/date-ranges/date-range.helper';
import seed from './data/seed';
import { KPIFilterHelper } from './data/models/app/kpis/kpi-filter.helper';
import { readMongooseSchema } from './lib/utils';
import { KPITypeEnum, IKPIFilter } from './data/models/app/kpis/IKPI';
import { KPIExpressionHelper } from './data/models/app/kpis/kpi-expression.helper';
import { SaleSchema } from './data/models/app/sales/Sale';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';

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


// console.log(b);

// console.log('done');
// import * as request from 'request';
// import { IAccountDBUser } from './data/models/master';
// import { config } from './config';

// function createAccountDbUser(accountDbUser: IAccountDBUser, config): Promise<boolean> {
//     let body = {
//         databaseName: 'admin',
//         roles: accountDbUser.roles,
//         username: accountDbUser.user,
//         password: accountDbUser.pwd
//     };

//     let options: request.Options = {
//         uri: config.mongoDBAtlasCredentials.uri,
//         auth: {
//             user: config.mongoDBAtlasCredentials.username,
//             pass: config.mongoDBAtlasCredentials.api_key,
//             sendImmediately: false
//         },
//         json: body
//     };

//     // curl -u "orlando@atlaskpi.com:16626d64-e21d-4208-b9b0-02a07020e6b7" --digest -i "https://cloud.mongodb.com/api/atlas/v1.0?pretty=true"
//     return new Promise<boolean>((resolve, reject) => {
//         request.post(options, function(error, response, body) {
//             if (!error) {
//                 console.log('User created...');
//                 resolve(true);
//             } else {
//                 // console.log('Code : ' + response.statusCode);
//                 // console.log('error : ' + error);
//                 // console.log('body : ' + body);
//                 console.log('Error creating db user: ' + error);
//                 reject(false);
//             }
//         });
//     });

// }

// createAccountDbUser({
//     user: 'user1',
//     pwd: 'PassWORD01$',
//     roles: [
//         { roleName: 'dbAdmin', databaseName: 'master' },
//         { roleName: 'readWrite', databaseName: 'master' }
//     ]
//  }, config);


// let a = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.Simple, 'sum(expenses.concept.amout) - 0.15');
// console.dir(a);

// let b = KPIExpressionHelper.ComposeExpression(KPITypeEnum.Simple, JSON.stringify(a));
// console.dir(b);


// let filters: IKPIFilter[] = [
//     {
//         field: 'product.paid',
//         operator: 'gte',
//         criteria: ''
//     },
//     {
//         field: 'employee.externalId',
//         operator: 'eq',
//         criteria: '4260'
//     },
//     {
//         field: 'product.itemCode',
//         operator: 'in',
//         criteria: '2345,5678,8912'
//     }
// ];


// let singleFilter: IKPIFilter[] = [
//     {
//         field: 'product.paid',
//         operator: 'gte',
//         criteria: ''
//     }
// ];



// let f = KPIFilterHelper.ComposeFilter(KPITypeEnum.Simple, JSON.stringify(filters) );
// console.log(JSON.stringify(f));

// let g = KPIFilterHelper.ComposeFilter(KPITypeEnum.Simple, JSON.stringify(singleFilter) );
// console.log(JSON.stringify(g));

// let h = KPIFilterHelper.DecomposeFilter(KPITypeEnum.Simple, JSON.parse('{"__dollar__and":[{"product__dot__paid":{"__dollar__gte":0}},{"employee__dot__externalId":{"__dollar__eq":"4260"}},{"product__dot__itemCode":{"__dollar__in":["2345","5678","8912"]}}]}'));
// console.log(JSON.stringify(h));

// let i = KPIFilterHelper.DecomposeFilter(KPITypeEnum.Simple, JSON.parse('{"product__dot__paid":{"__dollar__gte":0}}'));
// console.log(JSON.stringify(i));

// seed();

const dateRanges = DateRangeHelper.GetDateRangeItems();
console.dir(dateRanges);