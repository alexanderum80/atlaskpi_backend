import { ConnectorTypeEnum } from '../connector-type.enum';
import { IOAuthConnector } from '../connector-base';

const openid_configuration = require('./openid_configuration.json');

export class QuickBooksOnlineConnector implements IOAuthConnector {
    constructor() {

    }

    getType(): ConnectorTypeEnum {
        return ConnectorTypeEnum.QuickBooksOnline;
    }

    getTypeString(): string {
        return ConnectorTypeEnum[ConnectorTypeEnum.QuickBooksOnline].toString();
    }
   

}