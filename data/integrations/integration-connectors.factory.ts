import { ConnectorTypeEnum, getConnectorType } from './models/connector-type';
import { IConnectorDocument } from '../models/master/connectors/index';
import { SquareConnector } from './models/square/square-connector';
import { IOAuthConnector } from './models/connector-base';

export class IntegrationConnectorFactory {
    static getInstance(code: string): IOAuthConnector {
        switch (code) {
            case 'qbo':
                // return new QuickBooksOnlineConnector();
            case 'square':
                return new SquareConnector();
            default:
                return null;
        }
    }

    static getInstanceFromDocument(connector: IConnectorDocument): IOAuthConnector {
        switch (getConnectorType(connector.type)) {
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
}