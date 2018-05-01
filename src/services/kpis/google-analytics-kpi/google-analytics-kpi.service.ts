import { inject, injectable } from 'inversify';

import { loadIntegrationConfig } from '../../../app_modules/integrations/models/load-integration-controller';
import { GoogleAnalytics } from '../../../domain/app/google-analytics/google-analytics.model';
import { FrequencyEnum } from '../../../domain/common/frequency-enum';
import { IConnectorDocument } from '../../../domain/master/connectors/connector';
import { CurrentAccount } from '../../../domain/master/current-account';
import { IGoogleAnalytics } from './../../../domain/app/google-analytics/google-analytics';
import { Logger } from './../../../domain/app/logger';
import { Connectors } from './../../../domain/master/connectors/connector.model';
import { getGoogleAnalyticsConnection } from './google-analytics-connection-handler';
import {
    cleanHeaders,
    constructDimensionsArray,
    fieldMetricsMap,
    generateBatchProperties,
    getAnalyticsData,
    IBatchProperties,
    mapMetricDimensionRow,
} from './google-analytics.helper';


@injectable()
export class GoogleAnalyticsKPIService {

    // private _analytics: any;
    // private _authClient: any;
    private _connector: IConnectorDocument;
    private _config: any;

    constructor(
        @inject(GoogleAnalytics.name) private _googleAnalyticsModel: GoogleAnalytics,
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
        @inject(Logger.name) private _logger: Logger
    ) { }

    public initializeConnection(connectorId: string): Promise<{ analytics: any, authClient: any }> {
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
                that._config = configDoc.config;
                resolve({
                    analytics: connectionResponse.conn,
                    authClient: connectionResponse.client
                });
                return;
            })
            .catch(err => reject(err));
        });
    }

    public cacheData(   analytics: any,     // analytics instance object
                        authClient: any,   // authClient instance object
                        startDate: string,
                        endDate: string,
                        field: string,
                        frequency?: FrequencyEnum,
                        filters?: string,
                        groupings?: string[]): Promise<IBatchProperties> {

        if (!Boolean(analytics)) {
            return Promise.reject('##GoogleAnalyticsKPI: you have to call initialize() before calling getData()');
        }

        const that = this;

        return <any> getAnalyticsData(analytics, authClient, this._connector.config.view.id, {
            startDate: startDate,
            endDate: endDate,
            metrics: [`ga:${field}`],
            filters: filters,
            dimensions: constructDimensionsArray(groupings, frequency),
            extraOpts: {
                'include-empty-rows': false
            }
        })
        .then(rawData => {
            // get batch properties
            const batchProps = generateBatchProperties(that._connector.id, that._connector.config.view.id);
            const analyticsData = that._mapToIGoogleAnalytics(rawData, batchProps, that._connector.config.view.timezone);
            return that._googleAnalyticsModel.model.batchUpsert(analyticsData, startDate, batchProps);
        });
    }

    private _mapToIGoogleAnalytics(data: any, batchProps: IBatchProperties, tz: string = 'Etc/Universal'): IGoogleAnalytics[] {
        // delete the 'ga:' substring
        const columnHeaders = cleanHeaders(data.columnHeaders || []);

        // shortcircuit to empty array if data or rows are null
        const rows = data && data.rows || [];

        const that = this;
        const view = that._connector.config.view;

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
        return <any>this._connectors.model.findById(connectorId).exec();
    }

  }