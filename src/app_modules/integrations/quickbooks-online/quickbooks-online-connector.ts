import * as Promise from 'bluebird';
import * as ClientOAuth2 from 'client-oauth2';
import * as request from 'request';

import { IAppConfig } from '../../../configuration/config-models';
import { IOAuth2Token } from '../../../domain/common/oauth2-token';
import { IConnectorConfigScope } from '../../../domain/master/connectors/connector';
import { IOAuthConfigOptions, IOAuthConnector } from '../models/connector-base';
import { IKeyValuePair } from './../../../domain/common/key-value-pair';
import { IConnectorConfig } from './../../../domain/master/connectors/connector';
import { ConnectorTypeEnum } from './../models/connector-type';

export interface IQuickBooksOnlineIntegrationConfig {
    clientId: string;
    clientSecret: string;
    requiredAuthScope: string;
    companyApiUrl: string;
    openIdConfig: any;
}

export class QuickBooksOnlineConnector implements IOAuthConnector {
    private _client: ClientOAuth2;
    private _name: string;
    private _token: IOAuth2Token;
    private _scope: IConnectorConfigScope[] = [{ name: 'bills'}, { name: 'invoices'}];
    private _realmId?: string;
    private _companyInfo: any;

    constructor(private _connectorConfig: any, private _config?: IAppConfig, realmId?: string) {
        if (!_connectorConfig) {
            console.log('you tried to create a quickbooks connector without config...');
            return null;
        }

        if (realmId) {
            this._realmId = realmId;
        }

        this._client = new ClientOAuth2(this.getAuthConfiguration());
    }

    getName(): string {
        return this._name || '';
    }

    getType(): ConnectorTypeEnum {
        return ConnectorTypeEnum.QuickBooksOnline;
    }

    getTypeString(): string {
        return ConnectorTypeEnum[ConnectorTypeEnum.QuickBooksOnline].toString();
    }

    getToken(url: string): Promise<IOAuth2Token> {
        const that = this;
        return new Promise<IOAuth2Token>((resolve, reject) => {
            that._client.code.getToken(url).then(token => {
                that._token = <any>token.data;

                // lets grab the company info
                that._getCompanyInfo().then(info => {
                    that._name = (<any>info).response.CompanyInfo.CompanyName;
                    resolve(<any>token.data);
                    return;
                })
                .catch(err => reject(err));

            })
            .catch(err => reject(err));
        });
    }

    revokeToken(): Promise<any> {
        // revokeTokenUri: ,
        if (!this._realmId || !this._token) {
            return Promise.reject('connector not ready for revoke token');
        }

        const that = this;
        // prepare the test request to check if the access_token is good
        const url = this._connectorConfig.openIdConfig.revocation_endpoint;
        console.log('calling revoke token: ' + url);
        const auth = new Buffer(`${this._connectorConfig.clientId}:${this._connectorConfig.clientSecret}`).toString('base64');
        const requestObj = {
            url: url,
            method: 'POST',
            json: { token: that._token.refresh_token },
            headers: {
            'Authorization': 'Basic ' + auth,
            'Accept': 'application/json'
            },
        };

        return new Promise<any>((resolve, reject) => {
            request(requestObj, (err, res: Response) => {
                if ((<any>res).statusCode === 200) {
                    console.log('token revoked');
                    resolve();
                    return;
                } else {
                    const err = ('something went wrong, server respond: ' + (<any>res).statusCode);
                    console.log(err);
                    reject(err);
                }
            });
        });
    }

    setRealmId(realmId: string): void {
        this._realmId = realmId;
    }

    setToken(token: IOAuth2Token): void {
        this._token = token;
    }

    setScope(scope: IConnectorConfigScope[]): void {
        this._scope = scope;
    }

    getUniqueKeyValue(): IKeyValuePair {
        return  {
                  key: 'config.realmId',
                  value: this._realmId
        };
    }

    getRealmId(): string {
        return this._realmId;
    }

    getConfiguration(): IConnectorConfig {
        if (!this._token || !this._realmId) {
            console.log('configuration not ready... you have to request a token and set a realmid');
        }

        const config: IConnectorConfig = {
            realmId: this._realmId,
            token: this._token,
            scope: this._scope
        };

        return config;
    }

    private _getCompanyInfo(): Promise<any> {
        if (!this._realmId || !this._token) {
            console.log('');
            return Promise.reject('connector not ready for getting comapny info');
        }

        const that = this;
        // prepare the test request to check if the access_token is good
        const url = this._connectorConfig.companyApiUrl + this._realmId + '/companyinfo/' + this._realmId;
        console.log('Making API call to: ' + url);
        const requestObj = {
            url: url,
            headers: {
            'Authorization': 'Bearer ' + this._token.access_token,
            'Accept': 'application/json'
            }
        };

        return new Promise<any>((resolve, reject) => {
            request(requestObj, (err, res: Response) => {
                if ((<any>res).statusCode === 401) {
                    console.log('401 Code received, lets try to refresh the token');
                    that._refreshTokens(that._token).then(newOAuthToken => {
                        requestObj.headers.Authorization = 'Bearer ' + newOAuthToken.accessToken;
                        console.log('Trying again, making API call to: ' + requestObj.url);
                        request(requestObj, (err2, res2) => {
                            // if at this point there is an error, should be handled in the caller function
                            const json = ( < any > res2).toJSON();
                            const body = JSON.parse(json.body);
                            console.log('connection adquired for: ' + body.CompanyInfo.CompanyName);
                            that._companyInfo = body;
                            const companyInfo = {
                                error: err2,
                                response: body,
                            };
                            resolve(companyInfo);
                            return;
                        });
                    })
                    .catch(err => {
                        reject(err);
                        return;
                    });
                } else {
                    const json = ( < any > res).toJSON();
                    const body = JSON.parse(json.body);
                    console.log('connection adquired for: ' + body.CompanyInfo.CompanyName);
                    that._companyInfo = body;
                    const companyInfo = {
                        error: err,
                        response: body,
                    };

                    resolve(companyInfo);
                    return;
                }
            });
        });
    }

    private _refreshTokens(token: IOAuth2Token): Promise<ClientOAuth2.Token> {
        const that = this;

        return new Promise<ClientOAuth2.Token>((resolve, reject) => {
            if (!token || !token.access_token) {
                return reject('invalid token data, cannot create token');
            }

            const tokenObj = that._client.createToken(
                token.access_token,
                token.refresh_token,
                token.token_type,
                <any>token
            );

            return tokenObj.refresh().then(newOAuthToken => {
                that._token = <any>newOAuthToken.data;
                resolve(newOAuthToken);
                return;
            })
            .catch(err => reject(err));
        });
    }

    private getAuthConfiguration(): IOAuthConfigOptions {
        return {
            clientId: this._connectorConfig.clientId,
            clientSecret: this._connectorConfig.clientSecret,
            redirectUri: this._config.integrationRedirectUrl,
            authorizationUri: this._connectorConfig.openIdConfig.authorization_endpoint,
            accessTokenUri: this._connectorConfig.openIdConfig.token_endpoint,
            scopes: this._connectorConfig.requiredAuthScope
        };
    }



}