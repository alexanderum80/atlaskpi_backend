import * as Promise from 'bluebird';

import { IIdName } from './../../../domain/common/id-name';
import { IConnector } from './../../../domain/master/connectors/connector';
import { ConnectorTypeEnum } from './connector-type';

export interface IOAuth2Token {
    access_token: string;
    token_type: string;
    expires_at: string;
    merchant_id?: string;
    refresh_token?: string;
    x_refresh_token_expires_in?: string|number;
}

export interface IOAuthConfigOptions {
    clientId?: string;
    clientSecret?: string;
    code?: string;
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

export interface IKeyValuePair {
    key: string;
    value: string;
}

export interface IOAuthConnector {
    // Get
    getType(): ConnectorTypeEnum;
    getTypeString(): string;
    getConfiguration(): IConnector | any;
    getToken(originalUrl: string): Promise<IOAuth2Token>;
    getName(): string;
    getUniqueKeyValue(): IKeyValuePair;

    revokeToken(): Promise<any>;

    // user by quickbooks online
    setRealmId?(realmId: string): void;
    getRealmId?(): string;

    // linkedin
    getLinkedInCompanies?(): IIdName[];
    getFacebookPages?(): any[];
}
