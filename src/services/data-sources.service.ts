import { DataSourceResponse } from '../app_modules/data-sources/data-sources.types';
import { injectable, inject } from 'inversify';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { DataSourceSchemasMapping, DataSourcesHelper } from '../app_modules/data-sources/queries/datasource.helper';
import { sortBy } from 'lodash';

// return Promise.resolve(dataSources);

@injectable()
export class DataSourcesService {

    constructor(@inject(VirtualSources.name) private _virtualDatasources: VirtualSources) { }

    async get(): Promise<DataSourceResponse[]> {
        const virtualSources = await this._virtualDatasources.model.getDataSources();
        const dataSources = DataSourceSchemasMapping.map(s => {
            return {
                name: s.name.toLocaleLowerCase(),
                fields: DataSourcesHelper.GetFieldsFromSchemaDefinition(s.definition),
                groupings: DataSourcesHelper.GetGroupingsForSchema(s.name)
            };
        });

        return sortBy(virtualSources.concat(dataSources), 'name');
    }
}