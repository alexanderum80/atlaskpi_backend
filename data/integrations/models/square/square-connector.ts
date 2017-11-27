import { IOAuth2Token } from '../../../models/common/oauth2-token.model';
import { IConnector, ISquareConnectorConfig, ISquareConnectorConfigScope } from '../../../models/master/connectors/index';
import { ConnectorTypeEnum } from '../connector-type';
import { IOAuthConfigOptions, IOAuthConnector } from '../connector-base';
import * as ClientOAuth2 from 'client-oauth2';
import * as path from 'path';
declare var require: any;

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
    private _scope: ISquareConnectorConfigScope[] = [
        {name: 'MERCHANT_PROFILE_READ'},  {name: 'PAYMENTS_READ'}, {name: 'ORDERS_READ'}
    ];

    constructor(code?: string) {
        this._code = code;
        this._clientAuth = new ClientOAuth2(this._getAuthConfiguration());
    }

    get code$() {
        return this._code;
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
                    resolve(token);
                }).catch(errToken => {
                    reject(errToken);
            });
        });
    }

    getConfiguration(): ISquareConnectorConfig {
        if (!this._token) { return; }

        const config: ISquareConnectorConfig = {
            token: this._token,
            scope: this._scope
        };
        return config;
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

}
