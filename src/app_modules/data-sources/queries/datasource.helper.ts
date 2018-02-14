import { injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { CallSchema } from '../../../domain/app/calls/call.model';
import { ExpenseSchema } from '../../../domain/app/expenses/expense.model';
import { InventorySchema } from '../../../domain/app/inventory/inventory.model';
import { SaleSchema } from '../../../domain/app/sales/sale.model';
import { field } from '../../../framework/decorators/field.decorator';
import { readMongooseSchema } from '../../../helpers/mongodb.helpers';
import { flatten } from '../../../helpers/object.helpers';
import { GroupingMap } from '../../charts/queries/chart-grouping-map';
import { AppointmentSchema } from './../../../domain/app/appointments/appointment-model';

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
    },
    {
        name: 'calls',
        definition: CallSchema
    },
    {
        name: 'appointments',
        definition: AppointmentSchema
    }
];

const BlackListedFieldNames = [
    // 'source',
    'externalId',
    // 'document.type',
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
            if (blackListed
                // lets blacklist arrays fields just until we support it
                || field.type === 'Array') {
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