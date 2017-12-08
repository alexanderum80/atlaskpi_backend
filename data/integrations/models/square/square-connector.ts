import { IConnector, IConnectorConfig, IConnectorConfigScope } from '../../../models/master/connectors/index';
import { ConnectorTypeEnum } from '../connector-type';
import { IKeyValuePair, IOAuth2Token, IOAuthConfigOptions, IOAuthConnector } from '../connector-base';
import * as ClientOAuth2 from 'client-oauth2';
import * as path from 'path';
import * as request from 'request';
import * as Promise from 'bluebird';

declare var require: any;

const REDIRECT_URI = 'http://localhost:9091/integration';
const AUTH_SCOPE = [
        'MERCHANT_PROFILE_READ',
        'PAYMENTS_READ',
        'ORDERS_READ'
];
const square_configuration = require('./square_configuration.json');

export class SquareConnector implements IOAuthConnector {

    private _code: string;
    private _token: IOAuth2Token;

    private _clientId = 'sq0idp-_Ojf7lOc-mlVXV67a5MlPA';
    private _clientSecret = 'sq0csp-8hJv6t0Xrbh2gkGqiziduQGgd47gBN5JnziuL4ZgA9k';

    private _clientAuth: ClientOAuth2;
    private _scope: IConnectorConfigScope[] = [
        {name: 'MERCHANT_PROFILE_READ'},  {name: 'PAYMENTS_READ'}, {name: 'ORDERS_READ'}
    ];

    private _companyInfo: any;
    private _name: string;
    private _merchantId: string;

    constructor(code?: string) {
        this._code = code;
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
            this._clientAuth.code.getToken(url, {
                    body: {
                        client_id: this._clientId,
                        client_secret: this._clientSecret
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
            })
            .catch(err => reject(err));
        });
    }

    revokeToken(): Promise<any> {
        if (!this._token) {
            return Promise.reject('connector');
        }

        const that = this;
        const url = square_configuration.revocation_endpoint;

        const requestObject = {
            url: url,
            method: 'POST',
            json: { client_id: this._clientId, access_token: this._token.access_token },
            headers: {
                'Authorization': 'Client ' + this._clientSecret
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
            clientId: this._clientId,
            clientSecret: this._clientSecret,
            scopes: AUTH_SCOPE,
            accessTokenUri: 'https://connect.squareup.com/oauth2/token',
            authorizationUri: 'https://connect.squareup.com/oauth2/authorize',
            redirectUri: REDIRECT_URI
        };
    }

    private _getLocation(): Promise<any> {
        if (!this._token) {
            return Promise.reject('connector not ready for getting locations');
        }

        const that = this;

        const url = 'https://connect.squareup.com/v2/locations';
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
                // check status code
                // if ((<any>res).statusCode === 401) {

                // }
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
