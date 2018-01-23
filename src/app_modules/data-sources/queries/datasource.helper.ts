import * as Promise from 'bluebird';
import { injectable } from 'inversify';
import { isObject, sortBy } from 'lodash';
import * as mongoose from 'mongoose';

import { ExpenseSchema } from '../../../domain/app/expenses/expense.model';
import { InventorySchema } from '../../../domain/app/inventory/inventory.model';
import { IKPIDataSourceHelper } from '../../../domain/app/kpis/kpi';
import { SaleSchema } from '../../../domain/app/sales/sale.model';
import { field } from '../../../framework/decorators/field.decorator';
import { readMongooseSchema } from '../../../helpers/mongodb.helpers';
import { flatten } from '../../../helpers/object.helpers';
import { GroupingMap } from '../../charts/queries/chart-grouping-map';

export const DataSourceSchemasMapping = [
    {
        name: 'sales',
        definition: SaleSchema
    },
    {
        name: 'expenses',
        definition: ExpenseSchema
    },
    {
        name: 'inventory',
        definition: InventorySchema
    }
];

const BlackListedFieldNames = [
    // 'source',
    'externalId',
    'document.type',
    'document.identifier'
];

export interface ISchemaField {
    path: string;
    type: string;
}

@injectable()
export class DataSourcesHelper {
    public static GetFieldsFromSchemaDefinition(schema: mongoose.Schema): ISchemaField[] {

        const objectifiedSchema = readMongooseSchema(schema);
        const flattenedSchema = flatten(objectifiedSchema);
        const fields = Object.keys(flattenedSchema).map(
            key => { return { path: key, type: flattenedSchema[key] }; }
        );

        const filteredFields = fields.filter(field => {
            const blackListed = BlackListedFieldNames.find(name => name === field.path);
            if (blackListed) {
                return null;
            }
            return field;
        });

        return filteredFields;
    }

    public static GetGroupingsForSchema(schemaName: string): string[] {
        const collection = GroupingMap[schemaName];
        return Object.keys(collection);
    }

}