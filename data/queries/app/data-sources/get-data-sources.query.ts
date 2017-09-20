import { GroupingMap } from '../charts/chart-grouping-map';
import { IAppModels } from './../../../models/app/app-models';
import { SaleSchema } from '../../../models/app/sales';
import { ExpenseSchema } from '../../../models/app/expenses';
import { IDataSource } from './../../../models/app/data-sources/IData-source';
import { QueryBase } from '../../query-base';
import { IKPIModel, IKPI } from '../../../models/app/kpis';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserModel, IPaginationDetails, IPagedQueryResult } from '../../../';
import * as mongoose from 'mongoose';
import { readMongooseSchema } from '../../../../lib/utils';
import { flatten } from '../../../../lib/utils';
import * as _ from 'lodash';

const Schemas = [
    {
        name: 'sales',
        definition: SaleSchema
    },
    {
        name: 'expenses',
        definition: ExpenseSchema
    }
];

const BlackListedFieldNames = [
                                'source',
                                'externalId',
                                'document.type',
                                'document.identifier'
                              ];

export class GetDataSourcesQuery extends QueryBase<IDataSource[]> {

    constructor(public identity: IIdentity, private _ctx: IAppModels) {
        super(identity);
    }

    // log = true;
    // audit = true;

    run(data: any): Promise<IDataSource[]> {
        const that = this;

        const dataSources = Schemas.map(s => {
            return {
                name: s.name,
                fields: that._getFieldsFromSchemaDefinition(s.definition),
                groupings: that._getGroupingsForSchema(s.name)
            };
        });

        return Promise.resolve(dataSources);
    }

    private _getFieldsFromSchemaDefinition(schema: mongoose.Schema) {

        const objectifiedSchema = readMongooseSchema(schema);
        const flattenedSchema = flatten(objectifiedSchema);

        const fields = Object.keys(flattenedSchema).map(
            key => { return { path: key, type: flattenedSchema[key] }; }
        );

        const filteredFiels = fields.filter(field => {
            const blackListed = BlackListedFieldNames.find(name => name === field.path);
            if (blackListed) {
                return null;
            }
            return field;
        });

        return filteredFiels;
    }

    private _getGroupingsForSchema(schemaName: string) {
        const collection = GroupingMap[schemaName];
        return Object.keys(collection);
    }
}
