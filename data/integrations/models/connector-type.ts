import { FacebookConnector } from './facebook/facebook-connector';
export enum ConnectorTypeEnum {
    Square = 1,
    QuickBooksOnline = 10,
    Instagram = 11,
    LinkedIn = 12,
    Facebook = 13
    Twitter = 16
}

export const ConnectorsTypeMap = {
    qbo: ConnectorTypeEnum.QuickBooksOnline,
    square: ConnectorTypeEnum.Square,
    instagram: ConnectorTypeEnum.Instagram,
    linkedin: ConnectorTypeEnum.LinkedIn,
    facebook: ConnectorTypeEnum.Facebook
};

export function getConnectorTypeId(type: ConnectorTypeEnum) {
    switch (type) {
        case ConnectorTypeEnum.QuickBooksOnline:
            return 'qbo';
        case ConnectorTypeEnum.Square:
            return 'square';
        case ConnectorTypeEnum.Instagram:
            return 'instagram';
        case ConnectorTypeEnum.LinkedIn:
            return 'linkedin';
        case ConnectorTypeEnum.Facebook:
            return 'facebook';
        case ConnectorTypeEnum.Twitter:
            return 'twitter';
        default: null;
    }
}

export function getConnectorType(type: string): ConnectorTypeEnum {
    return ConnectorsTypeMap[type] || null;
}
