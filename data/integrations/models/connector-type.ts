export enum ConnectorTypeEnum {
    Square = 1,
    QuickBooksOnline = 10,
    Instagram = 11
}

export const ConnectorsTypeMap = {
    qbo: ConnectorTypeEnum.QuickBooksOnline,
    square: ConnectorTypeEnum.Square,
    instagram: ConnectorTypeEnum.Instagram
};

export function getConnectorTypeId(type: ConnectorTypeEnum) {
    switch (type) {
        case ConnectorTypeEnum.QuickBooksOnline:
            return 'qbo';
        case ConnectorTypeEnum.Square:
            return 'square';
        case ConnectorTypeEnum.Instagram:
            return 'instagram';
        default: null;
    }
}

export function getConnectorType(type: string): ConnectorTypeEnum {
    return ConnectorsTypeMap[type] || null;
}
