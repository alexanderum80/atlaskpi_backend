import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { DataSourcesHelper } from '../app_modules/data-sources/queries/datasource.helper';
import { GoogleAnalyticsSchema } from '../domain/app/google-analytics/google-analytics.model';
import { IConnectorDocument } from '../domain/master/connectors/connector';
import { ExternalDataSourceResponse } from './../app_modules/data-sources/data-sources.types';
import { ISchemaField } from './../app_modules/data-sources/queries/datasource.helper';
import { Connectors } from './../domain/master/connectors/connector.model';
import { CurrentAccount } from './../domain/master/current-account';

export const ExternalDataSourceSchemasMapping = {
    googleanalytics: {
        name: 'Google Analytics',
        schema: GoogleAnalyticsSchema,
        modelName: '_connectors',
        type: 'googleanalytics'
    }
};

const BlackListedFieldNames = [
    '_batchId',
    '_batchTimestamp',
    'connector.conenctorId',
    'connector.viewId',
    'date'
];

@injectable()
export class ExternalDataSourcesService {

    constructor(
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount
    ) {
    }

    public getExternalDataSources(filter?: string): Promise<any[]> {
        const externalDataSources = [];
        const that = this;
        return new Promise<any[]>((resolve, reject) => {
            Promise .props(this._findConnectorsTasks())
                    .then(connectors => {
                        for (let key in connectors) {
                            const element = ExternalDataSourceSchemasMapping[key];
                            if (element) {
                                const fields = DataSourcesHelper.GetFieldsFromSchemaDefinition(element.schema);
                                const groupings = DataSourcesHelper.GetGroupingsForSchema(key);
                                externalDataSources.push(...that._createExternalDataSource(connectors[key],
                                                                                        fields,
                                                                                        groupings));
                            }
                        }

                        resolve(externalDataSources);
                        return;
                    })
                    .catch(err => {
                        return reject(err);
                    });
        });
    }

    private _findConnectorsTasks(): any {
        const tasks = {};
        for (let key in ExternalDataSourceSchemasMapping) {
            const element = ExternalDataSourceSchemasMapping[key];
            tasks[element.type] = this[element.modelName].model.find({
                databaseName: this._currentAccount.get.database.name,
                type: element.type
            });
        }

        return tasks;
    }

    private _createExternalDataSource(connectors: IConnectorDocument[], fields: ISchemaField[], groupings: string[]): any[] {
        const res = connectors.map(c => {
            return {
                id: c.type + c.id,
                name: c.name,
                connectorId: c.id,
                connectorType: c.type,
                fields: fields,
                groupings: groupings
            };
        });

        return res;
    }

}