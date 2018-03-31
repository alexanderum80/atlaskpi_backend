import { DataSourceResponse } from '../app_modules/data-sources/data-sources.types';
import { injectable, inject, Container } from 'inversify';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { DataSourceSchemasMapping, DataSourcesHelper } from '../app_modules/data-sources/queries/datasource.helper';
import { sortBy } from 'lodash';
import { Logger } from '../domain/app/logger';

// return Promise.resolve(dataSources);

@injectable()
export class DataSourcesService {

    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(Container.name) private _container: Container,
        @inject(VirtualSources.name) private _virtualDatasources: VirtualSources) { }

    async get(): Promise<DataSourceResponse[]> {
        const virtualSources = await this._virtualDatasources.model.getDataSources();
        const dataSources = DataSourceSchemasMapping.map(s => {
            return {
                name: s.name.toLocaleLowerCase(),
                dataSource: s.collectionName,
                fields: DataSourcesHelper.GetFieldsFromSchemaDefinition(s.definition),
                groupings: DataSourcesHelper.GetGroupingsForSchema(s.name)
            };
        });

        return sortBy(virtualSources.concat(dataSources), 'name');
    }

    async getDistinctValues(source: string, field: string, limit: number, filter: string): Promise<string[]> {
        try {
            const model = (this._container.get(source) as any).model;
            const criterias = await (model as any).findCriteria(field, limit, filter);
            return criterias;
        } catch (e) {
            this._logger.error('There was an error retrieving the distinct values', e);
            return [];
        }
    }
}


// const that: GetKpisCriteriaQuery = this;
//         const input: KPIFilterCriteria = data.input;

//         const kpiMapper: IKPIMapper = {
//             'sales': this._sales,
//             'expenses': this._expenses,
//             'inventory': this._inventory,
//             'calls': this._calls,
//             'appointments': this._appointments
//         };

//         return new Promise<KPICriteriaResult>((resolve, reject) => {
//             if (!input.kpi || !input.field) {
//                 reject({ message: 'Did not provide the fields', error: 'Did not provide the fields' });
//                 return;
//             }

//             // sales, expenses, inventory model
//             const kpi: any = kpiMapper[input.kpi.toLocaleLowerCase()].model;

//             if (kpi) {
//                 kpi.findCriteria(input.field, input.limit, input.filter).then((response: string[]) => {
//                     resolve({
//                         criteriaValue: response
//                     });
//                     return;
//                 }).catch(err => {
//                     reject({ message: 'unable to get data', errors: err});
//                 });
//             } else {
//                 reject({ message: 'no kpi provided', errors: 'no kpi provided' });
//                 return;
//             }
//         });