import { SquareConnector } from './models/square/square-connector';
import { IOAuthConnector } from './models/connector-base';

export class IntegrationConnectorFactory {
    static getInstance(code: string, urlPath?: any): IOAuthConnector {
        switch (code) {
            case 'qbo':
                // return new QuickBooksOnlineConnector();
            case 'square':
                return new SquareConnector(urlPath);
            default:
                return null;
        }
    }
}