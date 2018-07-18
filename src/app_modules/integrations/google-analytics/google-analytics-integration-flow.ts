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
    subdomain: string
): Promise <any[]> {

    if (!oAuthConnector.token()) {
        return Promise.reject('google analytics integration couldn\'t obtain a token');
    }

    let accountsCollection = [];
    let webPropertiesCollection = [];

    const that = this;
    return new Promise < any[] > ((resolve, reject) => {
        const analytics = _getAnalyticsObject(integrationConfig.config, oAuthConnector.token(), subdomain);
        getAnalyticsAccountList(analytics)
        .then(accounts => {
            console.log('found ' + accounts.items.length + ' analytics accounts...');
            accountsCollection = accounts.items;
            return getWebProperties(analytics, accounts);
        })
        .then(webProperties => {
            console.log(`found : ${webProperties.length} webproperties...`);
            return getProfiles(analytics, webProperties, webPropertiesCollection);
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

function getProfiles(analytics: any, webProperties: any[], webPropertiesCollection: any[]): Promise<any> {
    const profileRequests = [];
    webProperties.forEach(prop => {
        prop.items.forEach(item => {
            webPropertiesCollection.push(item);
            console.log('webproperty: ' + item.name);
            profileRequests.push({ accountId: item.accountId, webPropertyId: item.id});
        });
    });

    // concurrency 1 because analytics api only allow 10 req/seg
    return Promise .map(profileRequests,
                        p => Promise.delay(100, (<any>Promise.promisify<any>(analytics.management.profiles.list))( p )),
                        { concurrency: 1 });
}

function getWebProperties(analytics: any, accounts: any): Promise<any> {
    // concurrency 1 because analytics api only allow 10 req/seg
    return Promise .map(accounts.items,
                        a => Promise.delay(100, (<any>Promise.promisify<any>(analytics.management.webproperties.list))({ accountId: (<any>a).id })),
                        { concurrency: 1 });
}

function getAnalyticsAccountList(analytics: any): Promise<any> {
    return Promise.promisify<any>(analytics.management.accounts.list)();
}


function _getAnalyticsObject(config: any, token: IOAuth2Token, quotaUser?: string): any {
    if (!config || !token) {
        throw('missing arguments');
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
