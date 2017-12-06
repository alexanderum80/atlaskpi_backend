import { IIdName } from './../../../models/common/id-name';
import { IConnectorConfigScope, IConnectorConfig } from './../../../models/master/connectors/IConnector';
import { IOAuth2Token, IKeyValuePair } from './../connector-base';
import { ConnectorTypeEnum } from '../connector-type';
import { IOAuthConnector, IOAuthConfigOptions } from '../connector-base';
import * as ClientOAuth2 from 'client-oauth2';
import * as Promise from 'bluebird';
import * as request from 'request';
import { config } from '../../../../config';

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

    constructor(private _config: any) {
        if (!_config) {
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
                    client_id: this._config.clientId,
                    client_secret: this._config.clientSecret
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

                    that._pages = info.response.accounts.data;
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
            clientId: this._config.clientId,
            clientSecret: this._config.clientSecret,
            redirectUri: config.integrationRedirectUrl,
            authorizationUri: this._config.endpoints.authorization_endpoint,
            accessTokenUri: this._config.endpoints.token_endpoint,
            scopes: this._config.requiredAuthScope
        };
    }

    private _getPagesInfo(): Promise<any> {
        if (!this._token) {
            return Promise.reject('connector not ready for getting comapny info');
        }

        const that = this;
        // prepare the test request to check if the access_token is good
        const url = this._config.endpoints.pages_endpoint;
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
}
