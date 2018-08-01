import { GAJobsQueueService } from './../../../services/queues/ga-jobs-queue.service';
import * as Promise from 'bluebird';
// import * as googleapis from 'googleapis';
const googleapis = require('googleapis');

import { IOAuthConnector } from '../models/connector-base';
import { getConnectorTypeId } from '../models/connector-type';
import { IOAuth2Token } from './../../../domain/common/oauth2-token';
import { IConnectorDocument } from './../../../domain/master/connectors/connector';

export function getGoogleAnalyticsConnectors(
    oAuthConnector: IOAuthConnector,
    integrationConfig: IConnectorDocument,
    databaseName: string,
    subdomain: string,
    queueService: GAJobsQueueService
): Promise <any[]> {

    if (!oAuthConnector.token()) {
        return Promise.reject('google analytics integration couldn\'t obtain a token');
    }

    let accountsCollection = [];
    let webPropertiesCollection = [];

    const that = this;
    return new Promise < any[] > ((resolve, reject) => {
        const analyticsParams =  {
            analyticsConfig: integrationConfig.config,
            authToken: oAuthConnector.token(),
            subdomain: subdomain
        };

        getAnalyticsAccountList(queueService, analyticsParams)
        .then(accounts => {
            console.log('found ' + accounts.items.length + ' analytics accounts...');
            accountsCollection = accounts.items;
            return getWebProperties(queueService, analyticsParams, accounts);
        })
        .then(webProperties => {
            console.log(`found : ${webProperties.length} webproperties...`);
            return getProfiles(queueService, analyticsParams, webProperties, webPropertiesCollection);
        })
        .then(profiles => {
            console.log(`found : ${profiles.length} profiles...`);
            const newConnectors = getConnectors(profiles, integrationConfig.config, oAuthConnector,
                                                accountsCollection, webPropertiesCollection, databaseName, subdomain);
            resolve(newConnectors);
            return;
        })
        .catch(err => {
            console.log('error :' + err);
            reject(err);
        });

    });
}

function getConnectors( profiles: any[], config: any, oAuthConnector: IOAuthConnector,
                        accountsCollection: any[], webPropertiesCollection: any[],
                        databaseName: string, subdomain: string): any[] {
    const connectors = [];
    const connectorConfig = oAuthConnector.getConfiguration();
    const type = getConnectorTypeId(oAuthConnector.getType());

    profiles.forEach(profile => {
        console.log(`found : ${profile.items.length} views...`);
        const view = profile.items[0];
        console.log(`view id: ${view.id}`);
        const uniqueKeyValue = oAuthConnector.getUniqueKeyValue();
        connectorConfig.view = view;
        uniqueKeyValue.value = view.id;

        const accountElement = accountsCollection.find(e => e.id === view.accountId);
        const propElement = webPropertiesCollection.find(e => e.id === view.webPropertyId);

        const newConnector = {
            name: `${accountElement.name}(${propElement.name})`,
            active: true,
            config: { ... connectorConfig },
            databaseName: databaseName,
            subdomain: subdomain,
            type: type,
            virtualSource: 'google_analytics',
            createdBy: 'backend',
            createdOn: new Date(Date.now()),
            uniqueKeyValue: { ... uniqueKeyValue }
        };
        connectors.push(newConnector);
    });

    return connectors;
}

function getProfiles(queueService: GAJobsQueueService, analyticsParams: any, webProperties: any[], webPropertiesCollection: any[]): Promise<any> {
    const profileRequests = [];
    webProperties.forEach(prop => {
        prop.items.forEach(item => {
            webPropertiesCollection.push(item);
            console.log('webproperty: ' + item.name);
            profileRequests.push({ accountId: item.accountId, webPropertyId: item.id});
        });
    });

    return Promise .map(profileRequests,
                        p => queueService.queuedGARequest({
                                ...analyticsParams,
                                analyticsFn: 'management.profiles.list',
                                payload: p
                            })
                        );
}

function getWebProperties(queueService: GAJobsQueueService, analyticsParams: any, accounts: any): Promise<any> {
    return Promise .map(accounts.items,
                        i => queueService.queuedGARequest({
                                ...analyticsParams,
                                analyticsFn: 'management.webproperties.list',
                                payload: { accountId: (<any>i).id }
                            })
                        );
}

function getAnalyticsAccountList(queueService: GAJobsQueueService, analyticsParams: any): Promise<any> {
    return <any>queueService.queuedGARequest({
        ...analyticsParams,
        analyticsFn: 'management.accounts.list',
        payload: null
    });
}


function _getAnalyticsObject(config: any, token: IOAuth2Token, quotaUser?: string): any {
    if (!config || !token) {
        throw new Error('missing arguments');
    }
    const oauth2Client = new googleapis.auth.OAuth2(
        config.clientId,
        config.clientSecret,
        ''
    );

    oauth2Client.credentials = token;
    googleapis.options({
        auth: oauth2Client,
        quotaUser: quotaUser
    });

    return googleapis.analytics('v3');
}
