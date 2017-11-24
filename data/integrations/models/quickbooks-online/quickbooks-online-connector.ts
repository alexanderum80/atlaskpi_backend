import { ConnectorTypeEnum } from '../connector-type.enum';
import { IOAuthConnector, IOAuthConfigOptions, REDIRECT_URI } from '../connector-base';

const CLIENT_ID = 'Q0yRWngdvGMcdpbZgc8hVgc7Dh1PrmbGB5fWJcW4taHIwe4XkH';
const CLIENT_SECRET = 'WbVeVcUDt9ntyckPP02qw8QPeG7jgY8StjNbsjOw';
const SCOPES = ['com.intuit.quickbooks.accounting'];

const openid_configuration = require('./openid_configuration.json');

export class QuickBooksOnlineConnector implements IOAuthConnector {
    constructor() { }

    getType(): ConnectorTypeEnum {
        return ConnectorTypeEnum.QuickBooksOnline;
    }

    getTypeString(): string {
        return ConnectorTypeEnum[ConnectorTypeEnum.QuickBooksOnline].toString();
    }

    getAuthConfiguration(): IOAuthConfigOptions {
        return {
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI,
            authorizationUri: openid_configuration.authorization_endpoint,
            accessTokenUri: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
            scopes: SCOPES
        };
    }

}