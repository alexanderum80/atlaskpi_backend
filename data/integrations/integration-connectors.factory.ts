import { ConnectorTypeEnum, getConnectorType } from './models/connector-type';
import { IConnectorDocument } from './../models/master/connectors/IConnector';
import { QuickBooksOnlineConnector } from './models/quickbooks-online/quickbooks-online-connector';
import { IOAuthConnector } from './models/connector-base';
export class IntegrationConnectorFactory {
    static getInstance(code: string): IOAuthConnector {
        switch (code) {
            case 'qbo':
                return new QuickBooksOnlineConnector();
            default:
                return null;
        }
    }

    static getInstanceFromDocument(connector: IConnectorDocument): IOAuthConnector {
        switch (getConnectorType(connector.type)) {
            case ConnectorTypeEnum.QuickBooksOnline:
                return IntegrationConnectorFactory.getQuickBooksConnector(connector);
            default:
                return null;
        }
    }

    private static getQuickBooksConnector(connector: IConnectorDocument): QuickBooksOnlineConnector {
        const qbConnector = new QuickBooksOnlineConnector();
        qbConnector.setRealmId(connector.config.realmId);
        qbConnector.setToken(connector.config.token);
        return qbConnector;
    }
}