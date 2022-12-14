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


export class GoogleAnalyticsConnector implements IOAuthConnector {
    private _client: ClientOAuth2;
    private _name;
    private _token: IOAuth2Token;

    constructor(private _connectorConfig: any, private _config?: IAppConfig) {
        if (!_connectorConfig) {
            console.error('you tried to create a connector without config...');
            return null;
        }

        this._client = new ClientOAuth2(this.getAuthConfiguration());
    }

    getName(): string {
        return this._name || '';
    }

    getType(): ConnectorTypeEnum {
        return ConnectorTypeEnum.GoogleAnalytics;
    }

    getTypeString(): string {
        return ConnectorTypeEnum[ConnectorTypeEnum.GoogleAnalytics].toString();
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
                resolve(that._token);
                return;
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
                  key: 'config.view.id',
                  value: ''
        };
    }

    getConfiguration(): IConnectorConfig {
        if (!this._token) {
            console.error('configuration not ready... you have to request a token and set a realmid');
        }

        const config: IConnectorConfig = {
            token: this._token,
            accountId: ''
        };

        return config;
    }

    token(): IOAuth2Token {
        return this._token;
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
}
