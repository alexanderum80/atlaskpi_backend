import { IConnectorDocument } from './';

export const findKey = function(data: IConnectorDocument) {
    switch (data.type) {
        case 'quickbooks-online':
            return {
                key: 'config.realmId',
                value: data.config.realmId
            };
        case 'square':
            return {
                key: 'config.token.merchant_id',
                value: data.config.token.merchant_id
            };
    }
};