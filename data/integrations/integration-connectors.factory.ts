import { ConnectorTypeEnum, getConnectorType } from './models/connector-type';
import { IConnectorDocument } from '../models/master/connectors/index';
import { SquareConnector } from './models/square/square-connector';
import { IConnectorDocument } from './../models/master/connectors/IConnector';
import { QuickBooksOnlineConnector } from './models/quickbooks-online/quickbooks-online-connector';
import { IOAuthConnector } from './models/connector-base';

export class IntegrationConnectorFactory {
    static getInstance(code: string): IOAuthConnector {
        switch (code) {
            case 'qbo':
                return new QuickBooksOnlineConnector();
            case 'square':
                return new SquareConnector();
            default:
                return null;
        }
    }

    static getInstanceFromDocument(connector: IConnectorDocument): IOAuthConnector {
        switch (getConnectorType(connector.type)) {
            case ConnectorTypeEnum.QuickBooksOnline:
                return IntegrationConnectorFactory.getQuickBooksConnector(connector);
            case ConnectorTypeEnum.Square:
                return IntegrationConnectorFactory.getSquareConnector(connector);
            default:
                return null;
        }
    }

    private static getSquareConnector(connector: IConnectorDocument): SquareConnector {
        const squareConnector = new SquareConnector();
        squareConnector.setToken(connector.config.token);
        return squareConnector;
    }
    
    private static getQuickBooksConnector(connector: IConnectorDocument): QuickBooksOnlineConnector {
        const qbConnector = new QuickBooksOnlineConnector();
        qbConnector.setRealmId(connector.config.realmId);
        qbConnector.setToken(connector.config.token);
        return qbConnector;
    }
}