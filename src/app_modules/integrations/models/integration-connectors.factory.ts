import { inject, injectable } from 'inversify';

import { IAppConfig } from '../../../configuration/config-models';
import { IConnectorDocument } from '../../../domain/master/connectors/connector';
import { FacebookConnector } from '../facebook/facebook-connector';
import { IOAuthConnector } from './connector-base';
import { ConnectorTypeEnum, getConnectorType } from './connector-type';

export interface IIntegrationFactoryOptions {
    query?: any;
}

@injectable()
export class IntegrationConnectorFactory {

    constructor(@inject('Config') private _config: IAppConfig) {}

    getInstance(integrationConfig: any, code: string, options?: any): IOAuthConnector {
        switch (getConnectorType(code)) {
            // case ConnectorTypeEnum.QuickBooksOnline:
            //     return new QuickBooksOnlineConnector(integrationConfig, options.query.realmId);
            // case ConnectorTypeEnum.Square:
            //     return new SquareConnector(integrationConfig);
            // case ConnectorTypeEnum.Instagram:
            //     return new InstagramConnector(integrationConfig);
            // case ConnectorTypeEnum.LinkedIn:
            //     return new LinkedInConnector(integrationConfig);
            case ConnectorTypeEnum.Facebook:
                return new FacebookConnector(integrationConfig, this._config);
            default:
                return null;
        }
    }

    getInstanceFromDocument(integrationConfig: any, connector: IConnectorDocument): IOAuthConnector {
        switch (getConnectorType(connector.type)) {
            case ConnectorTypeEnum.QuickBooksOnline:
            //     return IntegrationConnectorFactory.getQuickBooksConnector(integrationConfig, connector);
            // case ConnectorTypeEnum.Square:
            //     return IntegrationConnectorFactory.getSquareConnector(integrationConfig, connector);
            // case ConnectorTypeEnum.Instagram:
            //     return IntegrationConnectorFactory.getInstagramConnector(integrationConfig, connector);
            // case ConnectorTypeEnum.LinkedIn:
            //     return IntegrationConnectorFactory.getLinkedInConnector(integrationConfig, connector);
            case ConnectorTypeEnum.Facebook:
                return IntegrationConnectorFactory.getFacebookConnector(integrationConfig, connector);
            default:
                return null;
        }
    }

    // private static getSquareConnector(integrationConfig, connector: IConnectorDocument): SquareConnector {
    //     const squareConnector = new SquareConnector(integrationConfig);
    //     squareConnector.setToken(connector.config.token);
    //     return squareConnector;
    // }

    // private static getQuickBooksConnector(integrationConfig: any, connector: IConnectorDocument): QuickBooksOnlineConnector {
    //     const qbConnector = new QuickBooksOnlineConnector(integrationConfig);
    //     qbConnector.setRealmId(connector.config.realmId);
    //     qbConnector.setToken(connector.config.token);
    //     return qbConnector;
    // }

    // private static getInstagramConnector(integrationConfig, connector: IConnectorDocument): InstagramConnector {
    //     const instaConnector = new InstagramConnector(integrationConfig);
    //     instaConnector.setToken(connector.config.token);
    //     return instaConnector;
    // }

    // private static getLinkedInConnector(integrationConfig, connector: IConnectorDocument): LinkedInConnector {
    //     const linkedInConnector = new LinkedInConnector(integrationConfig);
    //     linkedInConnector.setToken(connector.config.token);
    //     return linkedInConnector;
    // }

    private static getFacebookConnector(integrationConfig, connector: IConnectorDocument): FacebookConnector {
        const facebookConnector = new FacebookConnector(integrationConfig);
        facebookConnector.setToken(connector.config.token);
        return facebookConnector;
    }
}