import { ConnectorTypeEnum } from './connector-type.enum';

export const REDIRECT_URI = 'http://localhost:9091/integrations';

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
    getAuthConfiguration(): IOAuthConfigOptions;
}
