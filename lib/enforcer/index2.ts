// import { IIdentity } from '../../data/models';
// import * as logger from 'winston';

// // hasToBe.authorized

// // has.authorization.to('create-invoice')
// // hasToBe.authorized.to('create:invoice')
// // enforce.authorization.to('create:invoice')
// // needs.authotization.to('create-invoice')
// // makeSure.isAuthorized.to('create-invoice')
// // requires.authorization.to('create-incoice')

// // enforce.authorization.toAll(['add-product', 'manage-inventory'])
// // enforce.authorization.toAny(['admin'])

// // needs.authotization.for('')
// // needs.authorization.forAll(['activity1', 'activity2'])
// // needs.authorized.forAny(['activity1', 'activity2'])

// import { Enforcer } from './enforcer';
// import { EnforcerConfig, getEnforcerConfig } from './enforcer-config';


// // create enforcer instance
// let config = new EnforcerConfig();

// // global allow
// config.allow =  (identity, activity, cb) => {

// };

// // global deny
// config.deny = (identity, activity, cb) => {

// };

// // adding activities
// config.addActivities([
//     {
//         may: 'create-invoice',
//         // when: (identity, cb) => {
//         //     // do some logic in here
//         //     // maybe check user roles, call another service, etc
//         //     let someCondition = true;
//         //     cb(null, someCondition);
//         // },
//         hasPermissions: ['p3']
//     }
// ]);

// let identity: IIdentity = {
//     firstName: '',
//     middleName: '',
//     lastName: '',
//     username: '',
//     roles: [''],
//     permissions: ['p1', 'p2'],
//     dbUri: 'mongpdb://localhost/database'
// }

// logger.info('Creating enforcer instance');
// let enforce = new Enforcer(config, identity);

// export const enforcer = enforce;
