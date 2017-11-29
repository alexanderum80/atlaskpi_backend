import { IConnector } from './data/models/master/connectors/IConnector';
import { IMasterModels } from './data/models/master/master-models';
import { NumericWidget } from './data/models/app/widgets/numeric-widget';
import { initialRoles } from './data/models/master/accounts/initialRoles';
import { initRoles } from './lib/rbac/init-roles';
import { IWidgetInput } from './data/models/app/widgets';
import { getContext } from './data/models/app/app-context';
import { DateRangeHelper } from './data/queries/app/date-ranges/date-range.helper';
import seed from './data/seed';
import { KPIFilterHelper } from './data/models/app/kpis/kpi-filter.helper';
import { readMongooseSchema } from './lib/utils';
import { KPITypeEnum, IKPIFilter } from './data/models/app/kpis/IKPI';
import { KPIExpressionHelper } from './data/models/app/kpis/kpi-expression.helper';
import { SaleSchema } from './data/models/app/sales/Sale';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import { getMasterContext } from './data/models/master';

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

// const dateRanges = DateRangeHelper.GetDateRangeItems();
// console.dir(dateRanges);

// getContext('mongodb://localhost/company-test-3002').then(ctx => {
    // ctx.Widget.findOne({ _id: '59ea71b1e323909308aec307' }).then(w =>  {
    //     console.dir(w);

    //     const UIw = new NumericWidget((<any>w.toObject()), ctx);
    //     UIw.materialize().then(materialized => {
    //         console.log(materialized.value);
    //     });
    // });

    // const input: IWidgetInput = {
    //     name: 'Test Widget Updated',
    //     order: 1,
    //     description: 'just testing the update',
    //     type: 'numeric',
    //     size: 'big',
    //     color: 'purple',
    //     numericAttributes: {
    //         kpi: '59c3bd0c3da88e92a1703fd6',
    //         dateRange: { predefined: 'this month' },
    //     }
    // };

    // ctx.Widget.updateWidget('59e8faf95825025957b9f549', input).then(widget => {
    //     console.dir(widget);
    // });


// });

function createIntegration(ctx: IMasterModels) {
    const qbConnector: IConnector = {
        name: 'qbo',
        type: 'integration-config',
        databaseName: 'atlas',
        active: true,
        config: {
            clientId: 'Q0yRWngdvGMcdpbZgc8hVgc7Dh1PrmbGB5fWJcW4taHIwe4XkH',
            clientSecret: 'WbVeVcUDt9ntyckPP02qw8QPeG7jgY8StjNbsjOw',
            companyApiUrl: 'https://sandbox-quickbooks.api.intuit.com/v3/company/',
            requiredAuthScope: 'com.intuit.quickbooks.accounting',
            openIdConfig: {
                'issuer': 'https://oauth.platform.intuit.com/op/v1',
                'authorization_endpoint': 'https://appcenter.intuit.com/connect/oauth2',
                'token_endpoint': 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
                'userinfo_endpoint': 'https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo',
                'revocation_endpoint': 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke',
                'jwks_uri': 'https://oauth.platform.intuit.com/op/v1/jwks',
                'response_types_supported': [
                   'code'
                ],
                'subject_types_supported': [
                   'public'
                ],
                'id_token_signing_alg_values_supported': [
                   'RS256'
                ],
                'scopes_supported': [
                   'openid',
                   'email',
                   'profile',
                   'address',
                   'phone'
                ],
                'token_endpoint_auth_methods_supported': [
                   'client_secret_post',
                   'client_secret_basic'
                ],
                'claims_supported': [
                   'aud',
                   'exp',
                   'iat',
                   'iss',
                   'realmid',
                   'sub'
                ]
             }
        },
        createdOn: new Date(),
        updatedOn: new Date(),
        createdBy: 'xxrulixx@gmail.com',
    };

    const squareConnector: IConnector = {
        name: 'square',
        type: 'integration-config',
        databaseName: 'atlas',
        active: true,
        config: {
            clientId: 'sq0idp-_Ojf7lOc-mlVXV67a5MlPA',
            clientSecret: 'sq0csp-8hJv6t0Xrbh2gkGqiziduQGgd47gBN5JnziuL4ZgA9k',
            locationsApiUrl: 'https://connect.squareup.com/v2/locations',
            requiredAuthScope: [
                'MERCHANT_PROFILE_READ',
                'PAYMENTS_READ',
                'ORDERS_READ'
            ],
            square_configuration: {
                'authorization_endpoint': 'https://connect.squareup.com/oauth2/authorize',
                'token_endpoint': 'https://connect.squareup.com/oauth2/token',
                'revocation_endpoint': 'https://connect.squareup.com/oauth2/revoke',
                'subject_types_supported': [
                    'public'
                ],
                'scopes_supported': [
                    'MERCHANT_PROFILE_READ',
                    'PAYMENTS_READ',
                    'ORDERS_READ'
                ]
            }
        },
        createdOn: new Date(),
        updatedOn: new Date(),
        createdBy: 'xxrulixx@gmail.com',
    };



    ctx.Connector.create(squareConnector, (err, connector) => {
        if (err) {
            console.log(err);
            return;
        }
        console.dir(connector);
    });
}

getMasterContext().then(ctx => {
    createIntegration(ctx);
});