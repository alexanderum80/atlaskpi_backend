import { IKeyValuePair } from '../../../domain/common/key-value-pair';
import * as Promise from 'bluebird';
import * as ClientOAuth2 from 'client-oauth2';

import { IOAuth2Token } from '../../../domain/common/oauth2-token';
import { IConnectorConfig, IConnectorConfigScope } from '../../../domain/master/connectors/connector';
import { IOAuthConfigOptions, IOAuthConnector } from '../models/connector-base';
import { ConnectorTypeEnum } from '../models/connector-type';

export interface IInstagramIntegrationConfig {
    clientId: string;
    requiredAuthScope: string;
    companyApiUrl: string;
    instagramConfig: any;
}

export class InstagramConnector implements IOAuthConnector {
    private _client: ClientOAuth2;
    private _name: string;
    private _token: IOAuth2Token;
    private _scope;
    private _companyInfo: any;

    constructor(private _config: any) {
        if (!_config) {
            console.log('you tried to create a quickbooks connector without config...');
            return null;
        }

        this._client = new ClientOAuth2(this.getAuthConfiguration());
    }

    getName(): string {
        return this._name || '';
    }

    getType(): ConnectorTypeEnum {
        return ConnectorTypeEnum.Instagram;
    }

    getTypeString(): string {
        return ConnectorTypeEnum[ConnectorTypeEnum.Instagram].toString();
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
                that._name = (<any>token.data).user.full_name;
                resolve(<any>token.data);
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

    setScope(scope: IConnectorConfigScope[]): void {
        this._scope = scope;
    }

    getUniqueKeyValue(): IKeyValuePair {
        return  {
                  key: 'config.token.user.id',
                  value: (<any>this._token).user.id
        };
    }

    getConfiguration(): IConnectorConfig {
        if (!this._token) {
            console.log('configuration not ready... you have to request a token and set a realmid');
        }

        const config: IConnectorConfig = {
            token: this._token,
        };

        return config;
    }

    private getAuthConfiguration(): IOAuthConfigOptions {
        return {
            clientId: this._config.clientId,
            clientSecret: this._config.clientSecret,
            redirectUri: this._config.integrationRedirectUrl,
            authorizationUri: this._config.instagramConfig.authorization_endpoint,
            accessTokenUri: this._config.instagramConfig.token_endpoint,
            scopes: this._config.requiredAuthScope
        };
    }



}