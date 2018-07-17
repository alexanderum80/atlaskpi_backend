import { AppConnection } from '../app.connection';
import { ICOGSModel } from './cogs';
import { ModelBase } from '../../../type-mongo/model-base';
import { injectable, inject } from 'inversify';
import { getEmployeeSchema } from '../../common/employee.schema';
import { getCustomerSchema } from '../../common/customer.schema';
import { getLocationSchema } from '../../common/location.schema';
import * as logger from 'winston';
import * as mongoose from 'mongoose';
import { criteriaPlugin } from '../../../app_modules/shared/criteria.plugin';

const EntitySchema = {
    externalId: String,
    name: String,
};

const COGSProductSchema = {
    externalId: String,
    itemCode: String,
    itemDescription: String,
    itemName: String,
    quantity: Number,
    unitPrice: Number,
    tax: Number,
    tax2: Number,
    amount: Number,
    preTaxTotal: Number,
    paid: Number,
    discount: Number,
    unitCost: Number,
    totalCost: Number,
    profit: Number
};

const COGSSchema = new mongoose.Schema({
    source: String,
    externalId: String,
    billId: String,
    billDate: Date,
    chargeId: String,
    chargeDate: Date,
    location: getLocationSchema(),
    customer: getCustomerSchema(),
    employee: getEmployeeSchema(),
    category: EntitySchema,
    product: COGSProductSchema
});

COGSSchema.plugin(criteriaPlugin);

// INDEXES
COGSSchema.index({ 'billDate': 1 });
COGSSchema.index({ 'billDate': 1, 'billId': 1 });
COGSSchema.index({ 'billDate': 1, 'location.name': 1 });
COGSSchema.index({ 'billDate': 1, 'employee.fullName': 1 });
COGSSchema.index({ 'billDate': 1, 'product.itemDescription': 1 });
COGSSchema.index({ 'billDate': 1, 'category.name': 1 });

COGSSchema.statics.cogsOldestDate = function(collectionName: string): Promise<Object> {
    const COGSModel = (<ICOGSModel>this);

    return new Promise<Object>((resolve, reject) => {
        COGSModel.aggregate({ '$match': { 'billDate': { '$exists': true }}},
                    { '$sort': { 'billDate': 1 }},
                    { '$group': { '_id': null, 'oldestDate': { '$first': '$billDate' }}})
            .then(result => {
                const searchResult = {
                    name: collectionName,
                    data: result
                };
                resolve(searchResult);
        })
        .catch(err => {
            logger.error('There was an error retrieving cogs oldest Date', err);
            reject(err);
        });
    });
};

@injectable()
export class COGS extends ModelBase<ICOGSModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'COGS', COGSSchema, 'cogs');
    }
}
