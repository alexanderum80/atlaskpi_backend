import { IOAuth2Token } from '../../models/common/oauth2-token.model';
import { IConnector } from '../../models/master/connectors/index';
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

export interface IKeyValuePair {
    key: string;
    value: string;
}

export interface IOAuthConnector {
    getType(): ConnectorTypeEnum;
    getTypeString(): string;
    getConfiguration(): IConnector | any;
    getToken(originalUrl: string): Promise<IOAuth2Token>;
    getName(): string;
    getUniqueKeyValue(): IKeyValuePair;

    // user buy quickbooks online
    setRealmId?(realmId: string): void;
    getRealmId?(): string;
}