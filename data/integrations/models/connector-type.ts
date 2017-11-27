export enum ConnectorTypeEnum {
    Square = 1,
    QuickBooksOnline = 2
}


export function getConnectorTypeId(type: ConnectorTypeEnum) {
    switch (type) {
        case ConnectorTypeEnum.QuickBooksOnline:
            return 'qbp';
        case ConnectorTypeEnum.Square:
            return 'square';
    }
}