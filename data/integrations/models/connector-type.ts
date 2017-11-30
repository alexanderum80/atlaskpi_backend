export enum ConnectorTypeEnum {
    Square = 1,
    QuickBooksOnline = 10
}

export const ConnectorsTypeMap = {
    qbo: ConnectorTypeEnum.QuickBooksOnline,
    square: ConnectorTypeEnum.Square
};

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
    return ConnectorsTypeMap[type] || null;
}
