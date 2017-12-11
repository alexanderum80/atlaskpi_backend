import { IIdentity } from '../../../models/app/identity';
import { DataSourceSchemasMapping, DataSourcesHelper } from './datasource.helper';
import { IAppModels } from './../../../models/app/app-models';
import { IDataSource } from './../../../models/app/data-sources/IData-source';
import { QueryBase } from '../../query-base';
import { IKPIModel, IKPI } from '../../../models/app/kpis';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import * as mongoose from 'mongoose';
import { readMongooseSchema } from '../../../../lib/utils';
import { flatten } from '../../../../lib/utils';
import * as _ from 'lodash';

export class GetDataSourcesQuery extends QueryBase<IDataSource[]> {

    constructor(public identity: IIdentity,
                private _salesModel: ISaleModel,
                private _expenseModel: IExpenseModel) {
        super(identity);
    }

    // log = true;
    // audit = true;

    run(data: any): Promise<IDataSource[]> {
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
