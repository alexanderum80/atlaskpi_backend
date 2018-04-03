import { DataSourceResponse } from '../app_modules/data-sources/data-sources.types';
import { injectable, inject, Container } from 'inversify';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { DataSourceSchemasMapping, DataSourcesHelper } from '../app_modules/data-sources/queries/datasource.helper';
import { sortBy } from 'lodash';
import { Logger } from '../domain/app/logger';

@injectable()
export class DataSourcesService {

    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(Container.name) private _container: Container,
        @inject(VirtualSources.name) private _virtualDatasources: VirtualSources) { }

    async get(): Promise<DataSourceResponse[]> {
        const virtualSources = await this._virtualDatasources.model.getDataSources();
        return sortBy(virtualSources, 'name');
    }

    async getDistinctValues(source: string, field: string, limit: number, filter: string): Promise<string[]> {
        try {
            const model = (this._container.get(source) as any).model;
            return await (model as any).findCriteria(field, limit, filter);
        } catch (e) {
            this._logger.error('There was an error retrieving the distinct values', e);
            return [];
        }
    }
}
