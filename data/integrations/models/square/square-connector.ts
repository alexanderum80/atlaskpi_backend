import { ConnectorTypeEnum } from '../connector-type.enum';
import { IOAuthConfigOptions, IOAuthConnector } from '../connector-base';
import * as ClientOAuth2 from 'client-oauth2';
declare var require: any;

export class SquareConnector implements IOAuthConnector {

    private _code: string;
    private _clientId = 'sq0idp-_Ojf7lOc-mlVXV67a5MlPA';
    private _clientSecret = 'sq0csp-8hJv6t0Xrbh2gkGqiziduQGgd47gBN5JnziuL4ZgA9k';
    private _clientAuth: any;
    private _scope: string;
    private _token: string;

    constructor(code?: string, private urlPath?: any) {
        this._code = code;
        this._clientAuth = new ClientOAuth2(this.getConfiguration);
        this.setScopes();
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
                    that._token = token;
                    resolve(token);
                }).catch(errToken => {
                    reject(errToken);
            });
        });
    }

    setScopes() {
        this._scope = require('square_configuration.json');
    }

    getConfiguration(): IOAuthConfigOptions {
        const redirectUri = this.urlPath.protocol + '://' + this.urlPath.hostname + '.com';
        return {
            clientId: this._clientId,
            clientSecret: this._clientSecret,
            scopes: this._scope['scopes_supported'],
            accessTokenUri: 'https://connect.squareup.com/oauth2/token',
            authorizationUri: 'https://connect.squareup.com/oauth2/authorize',
            redirectUri: redirectUri
        };
    }

}
