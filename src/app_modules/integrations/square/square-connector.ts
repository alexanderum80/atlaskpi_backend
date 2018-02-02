import { IAppConfig } from '../../../configuration/config-models';
import * as Promise from 'bluebird';
import * as ClientOAuth2 from 'client-oauth2';
import {
    IConnector,
    IConnectorConfig,
    IConnectorConfigScope
} from '../../../domain/master/connectors/connector';
import { IOAuthConfigOptions, IOAuthConnector } from '../models/connector-base';
import { IKeyValuePair } from '../../../domain/common/key-value-pair';
import { IOAuth2Token } from '../../../domain/common/oauth2-token';
import * as path from 'path';
import * as request from 'request';
import { ConnectorTypeEnum } from '../models/connector-type';

export class SquareConnector implements IOAuthConnector {

    private _token: IOAuth2Token;

    private _clientAuth: ClientOAuth2;
    private _scope;
    private _companyInfo: any;
    private _name: string;
    private _merchantId: string;

    constructor(private _connectorConfig: any, private _config?: IAppConfig) {
        if (!_config) {
            console.log('you tried to create a quickbooks connector without config...');
            return null;
        }

        this._clientAuth = new ClientOAuth2(this._getAuthConfiguration());
    }

    getName(): string {
        return this._name || '';
    }

    getScope() {
        return this._scope;
    }

    getType(): ConnectorTypeEnum {
        return ConnectorTypeEnum.Square;
    }

    getTypeString(): string {
        return ConnectorTypeEnum[ConnectorTypeEnum.Square].toString();
    }

    getToken(url: string): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            that._clientAuth.code.getToken(url, {
                    body: {
                        client_id: this._connectorConfig.clientId,
                        client_secret: this._connectorConfig.clientSecret
                    }
                })
                .then(token => {
                    that._token = (<any>token).data;
                    that._merchantId = that._token.merchant_id;
                    that._name = 'Merchant: ' + that._merchantId;
                    resolve(that._token);
                    return;
                }).catch(errToken => {
                    reject(errToken);
                    return;
                });
        });
    }

    revokeToken(): Promise<any> {
        if (!this._token) {
            return Promise.reject('connector');
        }

        const that = this;
        const url = this._connectorConfig.square_configuration.revocation_endpoint;

        const requestObject = {
            url: url,
            method: 'POST',
            json: { client_id: this._connectorConfig.clientId, access_token: this._token.access_token },
            headers: {
                'Authorization': 'Client ' + this._connectorConfig.clientSecret
            }
        };

        return new Promise<any>((resolve, reject) => {
            request(requestObject, (err, res: Response, body) => {
                console.log('SQUARE REVOKE TOKEN RESPONSE: ' + JSON.stringify(body));
                if ((<any>res).statusCode === 200) {
                    resolve();
                    return;
                } else {
                    const err = ('something went wrong, server response: ' + (<any>res).statusCode);
                    reject(err);
                }
            });
        });
    }

    setToken(token: IOAuth2Token): void {
        this._token = token;
    }

    getConfiguration(): IConnectorConfig {
        if (!this._token) { return; }

        const config: IConnectorConfig = {
            token: this._token,
            scope: this._scope
        };
        return config;
    }

    getUniqueKeyValue(): IKeyValuePair {
        return {
            key: 'config.token.merchant_id',
            value: this._merchantId
        };
    }

    private _getAuthConfiguration(): IOAuthConfigOptions {
        return {
            clientId: this._connectorConfig.clientId,
            clientSecret: this._connectorConfig.clientSecret,
            scopes: this._connectorConfig.requiredAuthScope,
            accessTokenUri: this._connectorConfig.square_configuration.token_endpoint,
            authorizationUri: this._connectorConfig.square_configuration.authorization_endpoint,
            redirectUri: this._config.integrationRedirectUrl
        };
    }

    private _getLocation(): Promise<any> {
        if (!this._token) {
            return Promise.reject('connector not ready for getting locations');
        }

        const that = this;

        const url = this._connectorConfig.locationsApiUrl;
        const headers = {
            'Authorization': 'Bearer ' + this._token,
            'Accept': 'application/json'
        };
        const requestObject = {
            url: url,
            headers: headers
        };

        return new Promise<any>((resolve, reject) => {
            request(requestObject, (err, res: Response, body) => {

                const locationBody: any = JSON.stringify(JSON.parse(body));
                const locations = locationBody['locations'];
                that._companyInfo = locations[0];

                resolve({
                    error: err,
                    response: that._companyInfo
                });
                return;
            });
        });
    }

}
