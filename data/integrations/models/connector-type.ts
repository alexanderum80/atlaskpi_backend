export enum ConnectorTypeEnum {
    Square = 1,
    QuickBooksOnline = 10
}

export function getConnectorTypeId(type: ConnectorTypeEnum) {
    switch (type) {
        case ConnectorTypeEnum.QuickBooksOnline:
            return 'qbo';
        case ConnectorTypeEnum.Square:
            return 'square';
        default: null;
    }
}

export function getConnectorType(type: string): ConnectorTypeEnum {
    switch (type) {
        case 'qbo':
            return ConnectorTypeEnum.QuickBooksOnline;
        case 'square':
            return ConnectorTypeEnum.Square;
        default:
            return;
    }
}
