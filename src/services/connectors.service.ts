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
        @inject(KPIs.name) private _kpis: KPIs
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

    createCustomConnector(input, connectorType): Promise<IMutationResponse> {
        const inputName = input.inputName.split('.')[0];
        const connObj: IConnector = {
            name: input.inputName,
            databaseName: this._currentAccount.get.database.name,
            subdomain: this._currentAccount.get.database.name,
            type: connectorType,
            virtualSource: camelCase(inputName).toLowerCase(),
            config: {},
            createdBy: 'backend',
            createdOn: new Date(Date.now()),
            active: true
        };

        return new Promise<IMutationResponse> ((resolve, reject) => {
            this._connectors.model.addConnector(connObj).then(() => {
                let collectionName = camelCase(inputName);
                collectionName = collectionName.substr(collectionName.length - 1, 1) !== 's'
                                    ? collectionName.concat('s') : collectionName;

                input.fields = JSON.parse(input.fields);
                const inputDateField = input.fields.find(f => f.dateRangeField === true);
                let inputFieldsMap = {};
                inputFieldsMap['Source'] = {
                    path: 'source',
                    dataType: 'String',
                    allowGrouping: true
                };

                for (let i = input.fields.length - 1; i >= 0; i--) {
                    const f = input.fields[i];
                    const field = f.columnName;
                    const dataType = f.dataType;
                    inputFieldsMap[field] = {
                        path: field.toLowerCase().replace(' ', '_'),
                        dataType: dataType,
                    };
                    if (dataType === 'String') {
                        inputFieldsMap[field].allowGrouping = true;
                    }
                }

                const virtualSourceObj: IVirtualSource = {
                    name: camelCase(inputName).toLowerCase(),
                    description: input.inputName,
                    source: collectionName,
                    modelIdentifier: collectionName,
                    dateField: inputDateField.columnName.toLowerCase().replace(' ', '_'),
                    aggregate: [],
                    fieldsMap: inputFieldsMap
                };

                this._virtualSourceModel.model.addDataSources(virtualSourceObj).then(newVirtualSource => {
                    input.inputName = collectionName;
                    input.records = JSON.parse(input.records);

                    this._dataSourcesService.createVirtualSourceMapCollection(input).then(() => {
                        resolve({ success: true });
                        return;
                    });
                }).catch(err => {
                    resolve({ success: false, errors: [{ field: 'dataSource', errors: ['Unable to add data source'] }] });
                    return;
                });
            }).catch(err => {
                resolve({ success: false, errors: [{ field: 'connectors', errors: ['Unable to add connector'] }] });
                return;
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
            that._connectorInUseByModel(id).then((kpis: IConnectorDocument[]) => {

                // check if connector is in use by another model
                if (kpis.length) {
                    reject({ message: 'Connector is being used by ', entity: kpis, error: 'Connector is being used by '});
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

                        if (deletedConnector.type === 'customexcel' || deletedConnector.type === 'customcsv' || deletedConnector.type === 'customtable') {
                            that._virtualSources.model.removeDataSources(deletedConnector.virtualSource).then(virtualSource => {
                                that._dataSourcesService.removeVirtualSourceMapCollection(virtualSource.source).then(() => {
                                    resolve(deletedConnector);
                                    return;
                                });
                            });
                        } else {
                            resolve(deletedConnector);
                            return;
                        }
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

            this._connectors.model.findById(id)
                .then(connector => {

                    const virtualSourceName = connector.virtualSource;
                    
                    // contain regex expression to use for complex kpi
                    const expressionName: RegExp = new RegExp(virtualSourceName);

                    const simpleKpi: DocumentQuery<IKPIDocument[], IKPIDocument> = this._kpis.model.find({
                        expression: {
                            $regex: expressionName,
                        },
                        type: 'simple'
                    });

                    Promise.all([simpleKpi])
                        .spread((kpis: IConnectorDocument[]) => {
                            const expressionId: RegExp[] = kpis.map(k => new RegExp(k.id, 'i'));

                            this._kpis.model.find({
                                type: 'complex',
                                $or: [{ 
                                    expression: {
                                        $regex: expressionName
                                    }
                                }, {
                                    expression: {
                                        $in: expressionId
                                    }
                                }]
                            })
                            .then(res => {
                                kpis = kpis.concat(<any>res)
                                resolve(kpis);
                                return;
                            });
                            
                        }).catch(err => {
                            reject(err);
                            return;
                        });

                    }).catch(err => {
                        reject(err);
                        return;
                    })
        });
    }
}