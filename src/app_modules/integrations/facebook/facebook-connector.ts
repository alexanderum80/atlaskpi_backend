import * as Promise from 'bluebird';
import * as ClientOAuth2 from 'client-oauth2';
import * as request from 'request';

import { IAppConfig } from '../../../configuration/config-models';
import { IKeyValuePair } from '../../../domain/common/key-value-pair';
import { IOAuth2Token } from '../../../domain/common/oauth2-token';
import { IConnectorConfig } from '../../../domain/master/connectors/connector';
import { IOAuthConfigOptions, IOAuthConnector } from '../models/connector-base';
import { ConnectorTypeEnum } from './../models/connector-type';

export interface IFacebookPage {
    id: string;
    name: string;
    access_token: string;
}

export interface IFacebookConfig {
    clientId: string;
    requiredAuthScope: string;
    instagramConfig: any;
}

export class FacebookConnector implements IOAuthConnector {
    private _client: ClientOAuth2;
    private _name;
    private _token: IOAuth2Token;
    private _pages: IFacebookPage[];

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
        return ConnectorTypeEnum.Facebook;
    }

    getTypeString(): string {
        return ConnectorTypeEnum[ConnectorTypeEnum.Facebook].toString();
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
                that._getPagesInfo().then(info => {
                    if (info.error) {
                        reject(info.error);
                        return;
                    }

                    if (!info.response.accounts || !info.response.accounts.data) {
                        reject('account is not admin of any page');
                        return;
                    }

                    that._getLongLivedToken().then(longLivedToken => {
                        that._pages = info.response.accounts.data;
                        resolve(longLivedToken);
                        return;
                    })
                    .catch(err => {
                        reject(err);
                        return;
                    });
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
                  key: 'config.pageId',
                  value: ''
        };
    }

    getConfiguration(): IConnectorConfig {
        if (!this._token) {
            console.log('configuration not ready... you have to request a token and set a realmid');
        }

        const config: IConnectorConfig = {
            token: this._token,
            pageId: ''
        };

        return config;
    }

    getFacebookPages(): IFacebookPage[] {
        return this._pages;
    }

    private getAuthConfiguration(): IOAuthConfigOptions {
        return {
            clientId: this._connectorConfig.clientId,
            clientSecret: this._connectorConfig.clientSecret,
            redirectUri: this._config.integrationRedirectUrl,
            authorizationUri: this._connectorConfig.endpoints.authorization_endpoint,
            accessTokenUri: this._connectorConfig.endpoints.token_endpoint,
            scopes: this._connectorConfig.requiredAuthScope
        };
    }

    private _getPagesInfo(): Promise<any> {
        if (!this._token) {
            return Promise.reject('connector not ready for getting comapny info');
        }

        const that = this;
        // prepare the test request to check if the access_token is good
        const url = this._connectorConfig.endpoints.pages_endpoint;
        console.log('Making API call to: ' + url);
        const requestObj = {
            url: url + '&access_token=' + this._token.access_token,
            method: 'GET'
        };

        return new Promise<any>((resolve, reject) => {
            request(requestObj, (err, res: Response) => {
                const json = ( < any > res).toJSON();
                const body = JSON.parse(json.body);

                let error;
                let response;

                if (body.error) {
                    error = body.error;
                }

                if (body.id && body.name) {
                    response = body;
                }

                const result = {
                    error: error,
                    response: response
                };

                resolve(result);
                return;
                });
        });
    }

    private _getLongLivedToken(): Promise<IOAuth2Token> {
        const that = this;

        const body = {
            grant_type: 'fb_exchange_token',
            client_id: this._connectorConfig.clientId,
            client_secret: this._connectorConfig.clientSecret,
            fb_exchange_token: this._token.access_token
        };

        const requestObj = {
            url: this._connectorConfig.endpoints.token_endpoint,
            method: 'POST',
            json: body,
            headers: {
            'Accept': 'application/json'
            }
        };

        return new Promise<IOAuth2Token>((resolve, reject) => {
            request(requestObj, (err, res) => {
                const json = ( < any > res).toJSON();

                if (err) {
                    reject(err);
                    return;
                }

                if (json.body.error) {
                    reject(json.body.error);
                    return;
                }

                resolve(json.body);
                return;
            });
        });
    }
}
