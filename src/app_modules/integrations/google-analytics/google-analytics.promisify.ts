import * as Promise from 'bluebird';
import * as googleapis from 'googleapis';

// export function getAnalyticsAccountsAsync(analytics: any): Promise<any> {
//     return Promise.promisify(analytics.management.accounts.list, {context: analytics});
// }


export const getAnalyticsAccountsAsync = Promise.promisify<any>(list, {context: analytics});