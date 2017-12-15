import { Expenses } from '../../../domain/app/expenses/expense.model';
import { Sales } from '../../../domain/app/sales/sale.model';
import { DataSourceSchemasMapping, DataSourcesHelper } from './datasource.helper';
import { IKPIDataSourceHelper } from '../../../domain/app/kpis/kpi';
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { DataSourceResponse } from '../data-sources.types';
import { GetDataSourcesActivity } from '../activities';


@injectable()
@query({
    name: 'dataSources',
    activity: GetDataSourcesActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: DataSourceResponse, isArray: true }
})
export class DataSourcesQuery implements IQuery<DataSourceResponse[]> {
    private _kpiService: IKPIDataSourceHelper;

    constructor(@inject('Sale') private _sale: Sales, @inject('Expenses') private _expense: Expenses ) { }

    run(data: { filter: String,  }): Promise<DataSourceResponse[]> {
        const that = this;
        const dataSources = DataSourceSchemasMapping.map(s => {
            return {
                name: s.name,
                fields: DataSourcesHelper.GetFieldsFromSchemaDefinition(s.definition),
                groupings: DataSourcesHelper.GetGroupingsForSchema(s.name)
            };
        });

        return Promise.resolve(dataSources);
    }
}
