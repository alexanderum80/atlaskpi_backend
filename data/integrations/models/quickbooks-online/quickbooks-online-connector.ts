import { IQBOConnectorConfigScope, IQBOConnectorConfig } from './../../../models/master/connectors/IConnector';
import { IOAuth2Token } from './../connector-base';
import { ConnectorTypeEnum } from '../connector-type';
import { IOAuthConnector, IOAuthConfigOptions, REDIRECT_URI } from '../connector-base';
import * as ClientOAuth2 from 'client-oauth2';
import * as Promise from 'bluebird';

const CLIENT_ID = 'Q0yRWngdvGMcdpbZgc8hVgc7Dh1PrmbGB5fWJcW4taHIwe4XkH';
const CLIENT_SECRET = 'WbVeVcUDt9ntyckPP02qw8QPeG7jgY8StjNbsjOw';
const AUTH_SCOPES = ['com.intuit.quickbooks.accounting'];

const openid_configuration = require('./openid_configuration.json');

export class QuickBooksOnlineConnector implements IOAuthConnector {

    private _client: ClientOAuth2;

    private _realmId?: string;
    private _token: IOAuth2Token;
    private _scope: IQBOConnectorConfigScope[] = [{ name: 'bills'}, { name: 'invoices'}];

    constructor() {
        this._client = new ClientOAuth2(this.getAuthConfiguration());
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
                resolve(<any>token.data);
                return;
            })
            .catch(err => reject(err));
        });
    }

    setRealmId(realmId: string) {
        this._realmId = realmId;
    }

    getRealmId(): string {
        return this._realmId;
    }

    getConfiguration(): IQBOConnectorConfig {
        if (!this._token || !this._realmId) {
            console.log('configuration not ready... you have to request a token and set a realmid');
        }

        const config: IQBOConnectorConfig = {
            realmId: this._realmId,
            token: this._token,
            scope: this._scope
        };

        return config;
    }

    private getAuthConfiguration(): IOAuthConfigOptions {
        return {
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI,
            authorizationUri: openid_configuration.authorization_endpoint,
            accessTokenUri: openid_configuration.token_endpoint,
            scopes: AUTH_SCOPES
        };
    }

}