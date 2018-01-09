import { inject, injectable } from 'inversify';

import { loadIntegrationConfig } from '../../../app_modules/integrations/models/load-integration-controller';
import { GoogleAnalytics } from '../../../domain/app/google-analytics/google-analytics.model';
import { IConnectorDocument } from '../../../domain/master/connectors/connector';
import { IGoogleAnalytics } from './../../../domain/app/google-analytics/google-analytics';
import { Logger } from './../../../domain/app/logger';
import { Connectors } from './../../../domain/master/connectors/connector.model';
import { IConnectionResponse, getGoogleAnalyticsConnection } from './google-analytics-connection-handler';
import { generateBatchProperties, getAnalyticsData, mapMetricDimensionRow, IBatchProperties } from './google-analytics.helper';
import { CurrentAccount } from '../../../domain/master/current-account';

const cleanHeaders = (headers): string[] => headers.map(h => h.name.replace('ga:', ''));

@injectable()
export class GoogleAnalyticsKPIService {

    private _analytics: any;
    private _authClient: any;
    private _connector: IConnectorDocument;
    private _config: any;

    constructor(
        @inject(GoogleAnalytics.name) private _googleAnalyticsModel: GoogleAnalytics,
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
        @inject(Logger.name) private _logger: Logger
    ) { }

    public initialize(connectorId: string): Promise<any> {
        const that = this;
        let configDoc;
        let connector;
        return new Promise<any>((resolve, reject) => {
            loadIntegrationConfig(this._connectors, 'googleanalytics')
            .then(configDocument => {
                if (!configDocument) {
                    reject('connector configuration not found');
                    return;
                }

                configDoc = configDocument;
                return that._resolveConnector(connectorId.replace('googleanalytics', ''));
            })
            .then(connectorDocument => {
                if (!connectorDocument) {
                    reject('connector not found');
                    return;
                }

                connector = connectorDocument;
                return getGoogleAnalyticsConnection(configDoc, connector);
            })
            .then(connectionResponse => {
                if (connectionResponse.error) {
                    reject(connectionResponse.error);
                    return;
                }

                that._connector = connector;
                that._analytics = connectionResponse.conn;
                that._authClient = connectionResponse.client;
                that._config = configDoc.config;
                resolve();
                return;
            })
            .catch(err => reject(err));
        });
    }

    public getData( startDate?: string,
                    endDate?: string,
                    metrics?: string[],
                    dimensions?: string[]): Promise<IBatchProperties> {

        if (!this.isInitialized) {
            return Promise.reject('##GoogleAnalyticsKPI: you have to call initialize() before calling getData()');
        }

        const that = this;

        return getAnalyticsData(this._analytics, this._connector.config.view.id, {
            startDate: startDate,
            endDate: endDate,
            metrics: metrics,
            dimensions: dimensions,
            extraOpts: {
                'include-empty-rows': false
            }
        })
        .then(rawData => {
            const analyticsData = that._mapToIGoogleAnalytics(rawData, that._connector.config.view.timezone);
            return that._googleAnalyticsModel.model.batchUpsert(analyticsData);
        });
    }

    private _mapToIGoogleAnalytics(data: any, tz: string = 'Etc/Universal'): IGoogleAnalytics[] {
        // delete the 'ga:' substring
        const columnHeaders = cleanHeaders(data.columnHeaders || []);

        // shortcircuit to empty array if data or rows are null
        const rows = data && data.rows || [];

        const that = this;
        const view = that._connector.config.view;

        // get batch properties
        const batchProps = generateBatchProperties(that._connector.id, view.id);

        const result = rows.map(row => {
            return {
                connector: {
                    connectorId: that._connector.id,
                    connectorName: that._connector.name,
                    viewId: view.id
                },

                accountId: view.accountId,
                webPropertyId: view.webPropertyId,
                websiteUrl: view.websiteUrl,

                ...mapMetricDimensionRow(row, columnHeaders, tz),
                ...batchProps
            } as IGoogleAnalytics;
        });

        return result;
    }

    private _resolveConnector(connectorId: string): Promise<IConnectorDocument> {
        return this._connectors.model.findById(connectorId).exec();
    }

    get isInitialized(): boolean {
        return Boolean(this._analytics && this._authClient && this._config);
    }

}