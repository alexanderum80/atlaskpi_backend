import * as Promise from 'bluebird';
import * as ClientOAuth2 from 'client-oauth2';
import * as request from 'request';

import { IAppConfig } from '../../../configuration/config-models';
import { IIdName } from '../../../domain/common/id-name';
import { IKeyValuePair } from '../../../domain/common/key-value-pair';
import { IOAuth2Token } from '../../../domain/common/oauth2-token';
import { IConnectorConfig } from '../../../domain/master/connectors/connector';
import { IOAuthConfigOptions, IOAuthConnector } from '../models/connector-base';
import { ConnectorTypeEnum } from '../models/connector-type';

export interface ILinkedInConfig {
    clientId: string;
    requiredAuthScope: string;
    instagramConfig: any;
}

export class LinkedInConnector implements IOAuthConnector {
    private _client: ClientOAuth2;
    private _name;
    private _token: IOAuth2Token;
    private _companies: IIdName[];

    constructor(private _connectorConfig: any, private _config?: IAppConfig) {
        if (!_connectorConfig) {
            console.log('you tried to create a connector without config...');
            return null;
        }

        this._client = new ClientOAuth2(this.getAuthConfiguration());
    }

    getName(): string {
        return this._name || '';
    }

    getType(): ConnectorTypeEnum {
        return ConnectorTypeEnum.LinkedIn;
    }

    getTypeString(): string {
        return ConnectorTypeEnum[ConnectorTypeEnum.LinkedIn].toString();
    }

    getToken(url: string): Promise<IOAuth2Token> {
        const that = this;
        return new Promise<IOAuth2Token>((resolve, reject) => {
            that._client.code.getToken(url, {
                body: {
                    client_id: this._connectorConfig.clientId,
                    client_secret: this._connectorConfig.clientSecret
                }
            }).then(token => {
                that._token = <any>token.data;
                that._getCompanyInfo().then(info => {
                    if (info.error) {
                        reject(info.error);
                        return;
                    }

                    this._companies = info.response;
                    resolve(<any>token.data);
                    return;
                })
                .catch(err => {
                    reject(err);
                    return;
                });
            })
            .catch(err => reject(err));
        });
    }

    revokeToken(): Promise<any> {
        console.log('instragram doesnt have a revoke token endpoint... ');
        return Promise.resolve();
    }

    setToken(token: IOAuth2Token): void {
        this._token = token;
    }

    getUniqueKeyValue(): IKeyValuePair {
        return  {
                  key: 'config.companyId',
                  value: ''
        };
    }

    getConfiguration(): IConnectorConfig {
        if (!this._token) {
            console.log('configuration not ready... you have to request a token and set a realmid');
        }

        const config: IConnectorConfig = {
            token: this._token,
            companyId: ''
        };

        return config;
    }

    getLinkedInCompanies(): IIdName[] {
        return this._companies;
    }

    private getAuthConfiguration(): IOAuthConfigOptions {
        return {
            clientId: this._connectorConfig.clientId,
            clientSecret: this._connectorConfig.clientSecret,
            redirectUri: config.integrationRedirectUrl,
            authorizationUri: this._connectorConfig.endpoints.authorization_endpoint,
            accessTokenUri: this._connectorConfig.endpoints.token_endpoint,
            scopes: this._connectorConfig.requiredAuthScope
        };
    }

    private _getCompanyInfo(): Promise<any> {
        if (!this._token) {
            return Promise.reject('connector not ready for getting comapny info');
        }

        const that = this;
        // prepare the test request to check if the access_token is good
        const url = this._connectorConfig.endpoints.company_endpoint;
        console.log('Making API call to: ' + url);
        const requestObj = {
            url: url + '&oauth2_access_token=' + this._token.access_token,
            method: 'GET'
        };

        return new Promise<any>((resolve, reject) => {
            setTimeout(() => {
                request(requestObj, (err, res: Response) => {
                    const json = ( < any > res).toJSON();
                    const body = JSON.parse(json.body);

                    let error;
                    let response;

                    if (body.status) {
                        error = body;
                    }

                    if (body._total && body.values && body.values) {
                        response = body.values;
                    }

                    const result = {
                        error: error,
                        response: response
                    };

                    resolve(result);
                    return;
                });
            }, 5000);
        });
    }
}
