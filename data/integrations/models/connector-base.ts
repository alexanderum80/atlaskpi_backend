import { IQBOConnectorConfig } from './../../models/master/connectors/IConnector';
import { ConnectorTypeEnum } from './connector-type';
import * as Promise from 'bluebird';

export interface IOAuth2Token {
    expires_in: number;
    refresh_token: string;
    access_token: string;
    token_type: string;
    x_refresh_token_expires_in: number;
}

export interface IKeyValuePair {
  key: string;
  value: any;
}

export interface IOAuthConfigOptions {
    clientId?: string;
    clientSecret?: string;
    accessTokenUri?: string;
    authorizationUri?: string;
    redirectUri?: string;
    scopes?: string[];
    state?: string;
    body?: {
      [key: string]: string | string[];
    };
    query?: {
      [key: string]: string | string[];
    };
    headers?: {
      [key: string]: string | string[];
    };
}

export interface IOAuthConnector {
    // Get
    getType(): ConnectorTypeEnum;
    getTypeString(): string;
    getToken(originalUrl: string): Promise<IOAuth2Token>;
    getConfiguration(): IQBOConnectorConfig | any;
    // getAuthConfiguration(): IOAuthConfigOptions;
    getName(): string;
    getUniqueKeyValue(): IKeyValuePair;

    // user buy quickbooks online
    setRealmId?(realmId: string): void;
    getRealmId?(): string;
}
