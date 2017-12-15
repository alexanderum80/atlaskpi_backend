import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { getCustomerSchema } from '../../common/customer.schema';
import { parsePredifinedDate } from '../../common/date-range';
import { getEmployeeSchema } from '../../common/employee.schema';
import { getLocationSchema } from '../../common/location.schema';
import { getProductSchema } from '../../common/product.schema';
import { AppConnection } from '../app.connection';
import { ISaleDocument, ISaleModel } from './sale';


let Schema = mongoose.Schema;

let EntitySchema = {
    externalId: String,
    name: String,
};

let LocationSchema = {
    externalId: String,
    identifier: String,
    name: String,
    city: String,
    state: String,
    zip: String,

    type: String,
    size: String
};

let CustomerSchema = {
        externalId: String,
        city: String,
        state: String,
        zip: String,
        gender: String,
};

let EmployeeSchema = {
    externalId: String,
    fullName: String,
    role: String,
    type: String, // full time (f), part time (p)
    workedTime: Number // time in seconds
};

let ProductSchema = {
    externalId: String,
    itemCode: String,
    itemDescription: String,
    quantity: Number,
    unitPrice: Number,
    tax: Number,
    tax2: Number,
    amount: Number,
    paid: Number,
    discount: Number,
    from: Date,
    to: Date,
    type: String
};

let CategorySchema = {
    externalId: String,
    name: String,
    service: Number,
};

let DocumentSchema = {
    type: String,
    indentifier: String,
};

let PaymentSchema = {
    method: String,
    type: String,
    amount: Number
};

let BusinessUnitSchema = {
    name: String
};


let SalesSchema = new Schema ({
    source: String,
    externalId: { type: String, unique: true },
    location: (<any>getLocationSchema()),
    customer: (<any>getCustomerSchema()),
    employee: (<any>getEmployeeSchema()),
    product: (<any>getProductSchema()),
    category: CategorySchema,

    timestamp: Date,
    concept: String,
    document: DocumentSchema,
    payment: PaymentSchema,
    businessUnit: (<any>BusinessUnitSchema),
    serviceType: String
});

export const SaleSchema = SalesSchema;

// INDEXES

SaleSchema.index({ 'product.from': 1 });
SaleSchema.index({ 'product.from': 1, 'location.name': 1 });
SaleSchema.index({ 'product.from': 1, 'businessUnit.name': 1 });
SaleSchema.index({ 'product.from': 1, 'serviceType': 1 });
SaleSchema.index({ 'product.from': 1, 'employee.type': 1, 'location.name': 1 });
SaleSchema.index({ 'product.from': 1, 'product.itemDescription': 1 });
SaleSchema.index({ 'product.from': 1, 'category.name': 1 });
SaleSchema.index({ 'product.from': 1, 'category.service': 1 });

// SaleSchema.methods.

// SaleSchema.statics.
SalesSchema.statics.findByPredefinedDateRange = function(predefinedDateRange: string): Promise<ISaleDocument[]> {
    const SalesModel = (<ISaleModel>this);
    const dateRange = parsePredifinedDate(predefinedDateRange);

    return new Promise<ISaleDocument[]>((resolve, reject) => {
        SalesModel.find({ 'product.from': { '$gte': dateRange.from, '$lte': dateRange.to } })
        .then(sales => {
            resolve(sales);
        })
        .catch(err => {
            logger.error('There was an error retrieving sales by predefined data range', err);
            reject(err);
        });
    });
};

@injectable()
export class Sales extends ModelBase<ISaleModel> {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Sale', SalesSchema, 'sales');
    }
}
