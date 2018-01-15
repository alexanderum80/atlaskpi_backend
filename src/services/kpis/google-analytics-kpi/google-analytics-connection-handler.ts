import * as googleapis from 'googleapis';

import { IConnectorDocument } from '../../../domain/master/connectors/connector';

export interface IConnectionResponse {
    error?: any;
    conn?: any;
    client?: any;
}

export function getGoogleAnalyticsConnection(integration: any, connector: IConnectorDocument): Promise < IConnectionResponse > {
    return new Promise < IConnectionResponse > ((resolve, reject) => {
        const OAuth2 = googleapis.auth.OAuth2;
        const oauth2Client = new OAuth2(
            integration.config.clientId,
            integration.config.clientSecret,
            ''
        );

        oauth2Client.credentials = connector.config.token;

        // set auth as a global default
        googleapis.options({
          auth: oauth2Client
        });

        const analytics = googleapis.analytics('v3');

        // test request
        analytics.data.ga.get({
                    auth: oauth2Client,
                    'ids': `ga:${connector.config.view.id}`,
                    'start-date': 'yesterday',
                    'end-date': 'today',
                    'metrics': 'ga:visits',
                }, (err, result) => {
            if (err) {
                console.log(err);
                reject({error: err});
                return;
            }

            resolve({ conn: analytics, client: oauth2Client });
            return;
        });
    });
}
