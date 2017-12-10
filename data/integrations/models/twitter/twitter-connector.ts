// import { IIdName } from '../../../models/common/id-name';
// import { ConnectorTypeEnum } from '../connector-type';
// import { IKeyValuePair, IOAuthConfigOptions, IOAuthConnector } from '../connector-base';
// import * as Promise from 'bluebird';
// import { config } from '../../../../config';
// import * as request from 'request';

// export interface ITwitterConfig {
//     endpoints: any;
// }


// // this is a little bit different OAuth v1
// export class TwitterConnector implements IOAuthConnector {
//     private _name;
//     private _token: any;

//     constructor(private _config: any) {
//         if (!_config) {
//             console.log('you tried to create a quickbooks connector without config...');
//             return null;
//         }
//     }

//     getName(): string {
//         return this._name || '';
//     }

//     getType(): ConnectorTypeEnum {
//         return ConnectorTypeEnum.Twitter;
//     }

//     getTypeString(): string {
//         return ConnectorTypeEnum[ConnectorTypeEnum.Twitter].toString();
//     }

//     getToken(url: string): Promise<any> {
//         const that = this;
//         return new Promise<any>((resolve, reject) => {
//             that._client.code.getToken(url, {
//                 body: {
//                     client_id: this._config.clientId,
//                     client_secret: this._config.clientSecret
//                 }
//             }).then(token => {
//                 that._token = <any>token.data;
//                 resolve(<any>token.data);
//                 return;
//             })
//             .catch(err => reject(err));
//         });
//     }

//     revokeToken(): Promise<any> {
//         console.log('instragram doesnt have a revoke token endpoint... ');
//         return Promise.resolve();
//     }

//     setToken(token: any): void {
//         this._token = token;
//     }

//     getUniqueKeyValue(): IKeyValuePair {
//         return  {
//                   key: 'config.companyId',
//                   value: ''
//         };
//     }

//     getConfiguration(): IConnectorConfig {
//         if (!this._token) {
//             console.log('configuration not ready... you have to request a token and set a realmid');
//         }

//         const config: IConnectorConfig = {
//             token: this._token,
//             companyId: ''
//         };

//         return config;
//     }

//     private getAuthConfiguration(): IOAuthConfigOptions {
//         return {
//             clientId: this._config.clientId,
//             clientSecret: this._config.clientSecret,
//             redirectUri: config.integrationRedirectUrl,
//             authorizationUri: this._config.endpoints.authorization_endpoint,
//             accessTokenUri: this._config.endpoints.token_endpoint,
//             scopes: this._config.requiredAuthScope
//         };
//     }

//     private _getCompanyInfo(): Promise<any> {
//         if (!this._token) {
//             return Promise.reject('connector not ready for getting comapny info');
//         }

//         const that = this;
//         // prepare the test request to check if the access_token is good
//         const url = this._config.endpoints.company_endpoint;
//         console.log('Making API call to: ' + url);
//         const requestObj = {
//             url: url + '&oauth2_access_token=' + this._token.access_token,
//             method: 'GET'
//         };

//         return new Promise<any>((resolve, reject) => {
//             setTimeout(() => {
//                 request(requestObj, (err, res: Response) => {
//                     const json = ( < any > res).toJSON();
//                     const body = JSON.parse(json.body);

//                     let error;
//                     let response;

//                     if (body.status) {
//                         error = body;
//                     }

//                     if (body._total && body.values && body.values) {
//                         response = body.values;
//                     }

//                     const result = {
//                         error: error,
//                         response: response
//                     };

//                     resolve(result);
//                     return;
//                 });
//             }, 5000);
//         });
//     }
// }
