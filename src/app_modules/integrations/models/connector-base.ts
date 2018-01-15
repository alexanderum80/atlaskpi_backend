import * as Promise from 'bluebird';

import { IKeyValuePair } from '../../../domain/common/key-value-pair';
import { IOAuth2Token } from '../../../domain/common/oauth2-token';
import { IIdName } from './../../../domain/common/id-name';
import { IConnector } from './../../../domain/master/connectors/connector';
import { ConnectorTypeEnum } from './connector-type';

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

    // facebook
    getFacebookPages?(): any[];

    // google analytics
    getGoogleAnalyticsAccounts?(): any[];
    token?(): IOAuth2Token;
}
