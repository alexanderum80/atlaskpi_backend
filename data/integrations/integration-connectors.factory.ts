import { InstagramConnector } from './models/instagram/instagram-connector';
import { ConnectorTypeEnum, getConnectorType } from './models/connector-type';
import { SquareConnector } from './models/square/square-connector';
import { IConnectorDocument } from './../models/master/connectors/IConnector';
import { QuickBooksOnlineConnector } from './models/quickbooks-online/quickbooks-online-connector';
import { IOAuthConnector } from './models/connector-base';

export interface IIntegrationFactoryOptions {
    query?: any;
}

export class IntegrationConnectorFactory {
    static getInstance(integrationConfig: any, code: string, options?: any): IOAuthConnector {
        switch (getConnectorType(code)) {
            case ConnectorTypeEnum.QuickBooksOnline:
                return new QuickBooksOnlineConnector(integrationConfig, options.query.realmId);
            case ConnectorTypeEnum.Square:
                return new SquareConnector(integrationConfig);
            case ConnectorTypeEnum.Instagram:
                return new InstagramConnector(integrationConfig);
            default:
                return null;
        }
    }

    static getInstanceFromDocument(integrationConfig: any, connector: IConnectorDocument): IOAuthConnector {
        switch (getConnectorType(connector.type)) {
            case ConnectorTypeEnum.QuickBooksOnline:
                return IntegrationConnectorFactory.getQuickBooksConnector(integrationConfig, connector);
            case ConnectorTypeEnum.Square:
                return IntegrationConnectorFactory.getSquareConnector(integrationConfig, connector);
            case ConnectorTypeEnum.Instagram:
                return IntegrationConnectorFactory.getSquareConnector(integrationConfig, connector);
            default:
                return null;
        }
    }

    private static getSquareConnector(integrationConfig, connector: IConnectorDocument): SquareConnector {
        const squareConnector = new SquareConnector(integrationConfig);
        squareConnector.setToken(connector.config.token);
        return squareConnector;
    }

    private static getQuickBooksConnector(integrationConfig: any, connector: IConnectorDocument): QuickBooksOnlineConnector {
        const qbConnector = new QuickBooksOnlineConnector(integrationConfig);
        qbConnector.setRealmId(connector.config.realmId);
        qbConnector.setToken(connector.config.token);
        return qbConnector;
    }

    private static getInstagramConnector(integrationConfig, connector: IConnectorDocument): InstagramConnector {
        const instaConnector = new InstagramConnector(integrationConfig);
        instaConnector.setToken(connector.config.token);
        return instaConnector;
    }
}