import { ConnectorTypeEnum } from './connector-type.enum';
export interface IOAuthConfigOptions {
    clientId?: string;
    clientSecret?: string;
    code?: string;
    accessTokenUri?: string;
    authorizationUri?: string;
    redirectUri?: string;
    scopes?: string;
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
    getType(): ConnectorTypeEnum;
    getTypeString(): string;
    getConfiguration(): IOAuthConfigOptions;
}