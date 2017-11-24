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

    constructor(code?: string) {
        this._clientAuth = new ClientOAuth2(this.getAuthConfiguration());
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
        return '';
    }

    getToken() {
        // do something
        return this._clientAuth.getToken()
    }

    setScopes() {
        this.scope = require('square_configuration.json');
    }

    getAuthConfiguration(): IOAuthConfigOptions {
        return {
            clientId: this._clientId,
            clientSecret: this._clientSecret,
            code: this._code,
            scopes: this._scope['scopes_supported']
            accessTokenUri: 'https://connect.squareup.com/oauth2/token',
            authorizationUri: 'https://connect.squareup.com/oauth2/authorize',
            redirectUri: ''
        };
    }

}
