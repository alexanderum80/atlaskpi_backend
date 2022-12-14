import { Facebook } from 'fb';

import { IConnectorDocument } from '../../../domain/master/connectors/connector';

export interface IFBConnectionResponse {
    connection: Facebook;
    page: any;
}

export function getFacebookConnection(integration: any, connector: IConnectorDocument): Promise < IFBConnectionResponse > {
    return new Promise < IFBConnectionResponse > ((resolve, reject) => {
        const FB = new Facebook({version: 'v2.11'});
        const facebook = new FB.extend({ appId: integration.config.clientId, appSecret: integration.config.clientSecret});
        facebook.setAccessToken(connector.config.token.access_token);

        facebook.api('me', { fields: ['id', 'name', 'accounts'] }, (res) => {
            if (!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                reject(res.error);
                return;
            }

            const page = res.accounts.data.find(a => a.id === connector.config.pageId);
            console.log('connection adquired for: ' + page.name);

            resolve({
                connection: facebook,
                page: page
            });
            return;
        });

    });
}