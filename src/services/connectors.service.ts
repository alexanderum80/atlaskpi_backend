import { Dashboards } from './../domain/app/dashboards/dashboard.model';
import { IKPIDocument } from './../domain/app/kpis/kpi';
import { IMutationResponse } from './../framework/mutations/mutation-response';
import { CurrentAccount } from './../domain/master/current-account';
import { camelCase } from 'change-case';
import { IVirtualSourceFields, IVirtualSource } from './../domain/app/virtual-sources/virtual-source';
import { IConnector } from './../domain/master/connectors/connector';
import { DataSourcesService } from './data-sources.service';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IntegrationConnectorFactory } from '../app_modules/integrations/models/integration-connectors.factory';
import { loadIntegrationConfig } from '../app_modules/integrations/models/load-integration-controller';
import { Logger } from '../domain/app/logger';
import { IConnectorDocument } from '../domain/master/connectors/connector';
import { Connectors } from '../domain/master/connectors/connector.model';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { DocumentQuery } from 'mongoose';
import { KPIs } from '../domain/app/kpis/kpi.model';


@injectable()
export class ConnectorsService {

    constructor(
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(VirtualSources.name) private _virtualSourceModel: VirtualSources,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources,
        @inject(DataSourcesService.name) private _dataSourcesService: DataSourcesService,
        @inject(IntegrationConnectorFactory.name) private _integrationConnectorFactory: IntegrationConnectorFactory,
        @inject(Logger.name) private _logger: Logger,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(Dashboards.name) private _dashboards: Dashboards
    ) { }

    findConnectorsByDatabaseName(databaseName: string): Promise<IConnectorDocument[]> {
        const that = this;
        return new Promise<IConnectorDocument[]>((resolve, reject) => {
            that._connectors.model.find({ databaseName: databaseName })
            .then(connectors => {
                return resolve(connectors);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }

    findConnectorsBySubdomain(subdomain: string): Promise<IConnectorDocument[]> {
        const that = this;
        return new Promise<IConnectorDocument[]>((resolve, reject) => {
            that._connectors.model.find({ subdomain: subdomain })
            .then(connectors => {
                return resolve(connectors);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }

    removeConnector(id: string): Promise<IConnectorDocument> {
        const that = this;
        return new Promise<IConnectorDocument>((resolve, reject) => {
            that._connectorInUseByModel(id).then((connectors: IConnectorDocument[]) => {

                // check if connector is in use by another model
                if (connectors.length) {
                    reject({ message: 'Connector is being used by ', entity: connectors, error: 'Connector is being used by '});
                    return;
                }

                // remove connector when not in use
                that._connectors.model.removeConnector(id)
                    .then((deletedConnector) => {
                        // try to transparently revoke the token
                        that._disconnect(deletedConnector)
                            .then(() => {
                                that._logger.debug('connector: ' + deletedConnector.name + ' disconnected');
                            })
                            .catch(err => {
                                that._logger.debug('could not disconnect ' + deletedConnector.name);
                            });

                        resolve(deletedConnector);
                    })
                    .catch(err => reject(err));
                }).catch(err => reject(err));
        });
    }

    private _disconnect(doc: IConnectorDocument): Promise<any> {
        const that = this;
        return loadIntegrationConfig(this._connectors, doc.type).then(docConfig => {
            const connector = that._integrationConnectorFactory.getInstanceFromDocument(docConfig.config, doc);
            if (!connector) {
                return Promise.reject('could not get an instance of the connector');
            }
            return connector.revokeToken();
        });
    }


    private _connectorInUseByModel(id: string): Promise<IConnectorDocument[]> {
        const that = this;

        return new Promise<IConnectorDocument[]>((resolve, reject) => {
            // reject if no id is provided
            if (!id) {
                return reject({ success: false,
                                errors: [ { field: 'id', errors: ['Connector not found']} ] });
            }

            const expressionId: RegExp = new RegExp(id, 'i');

            const connectorsArray: any[] = [];

            this._connectors.model.findById(id)
                .then(connector => {

                    const virtualSourceName = connector.virtualSource && connector.virtualSource !== 'google_analytics' ? connector.virtualSource : null;

                    // contain regex expression to use for complex kpi
                    const expressionName: RegExp = new RegExp(virtualSourceName);

                    this._kpis.model.find({
                        expression: {
                            $regex: expressionName,
                        },
                        type: 'simple'
                    })
                    .then(kpis => {
                        const expressionKpiId: RegExp[] = kpis.map(k => new RegExp(k.id, 'i'));

                        this._kpis.model.find({
                            type: { $ne: 'simple' },
                            $or: [{
                                expression: {
                                    $regex: expressionName
                                }
                            }, {
                                expression: {
                                    $in: expressionKpiId
                                }
                            }, {
                                expression: {
                                    $regex: expressionId
                                }
                            }]
                        })
                        .then(res => {
                            kpis = kpis.concat(<any>res);
                            if (kpis.length) {
                                kpis.map(k => {
                                    connectorsArray.push({
                                        name: k.name,
                                        type: 'kpi'
                                    });
                                });
                            }

                            this._dashboards.model.find({
                                socialwidgets: {$in: [id]}
                            })
                            .then(dashboard => {
                                if (dashboard.length) {
                                    dashboard.map(d => {
                                        connectorsArray.push({
                                            name: d.name,
                                            type: 'dashboard'
                                        });
                                    });
                                }
                                resolve(<any>connectorsArray);
                                return;
                            })
                            .catch(err => {
                                reject(err);
                                return;
                            });
                        });
                    }).catch(err => {
                        reject(err);
                        return;
                    });
                }).catch(err => {
                    reject(err);
                    return;
                });
        });
    }
}