import { IOAuth2Token } from '../../../models/common/oauth2-token.model';
import { IConnector, IConnectorConfig, IConnectorConfigScope } from '../../../models/master/connectors/index';
import { ConnectorTypeEnum } from '../connector-type';
import { IKeyValuePair, IOAuthConfigOptions, IOAuthConnector } from '../connector-base';
import * as ClientOAuth2 from 'client-oauth2';
import * as path from 'path';
import * as request from 'request';

const REDIRECT_URI = 'http://localhost:9091/integration';
const AUTH_SCOPE = [
        'MERCHANT_PROFILE_READ',
        'PAYMENTS_READ',
        'ORDERS_READ'
];

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
            this._clientAuth.code.getToken(url)
                .then(token => {
                    that._token = (<any>token).data;
                    that._merchantId = that._token.merchant_id;

                    that._getLocation().then(info => {
                        that._name = (<any>info).response.name;
                        resolve(token);
                        return;
                    });
                }).catch(errToken => {
                    reject(errToken);
            });
        });
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
