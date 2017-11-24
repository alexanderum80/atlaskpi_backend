export enum ConnectorTypeEnum  {
    Instagram = 1, // example
    QuickBooksOnline = 10
}

export function getConnectorTypeId(type: ConnectorTypeEnum) {
    switch (type) {
        case ConnectorTypeEnum.QuickBooksOnline:
            return 'qbo';

        default: null;
    }
}
