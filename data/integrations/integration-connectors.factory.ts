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
}