import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isObject, filter, isEmpty } from 'lodash';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { criteriaPlugin } from '../../../app_modules/shared/criteria.plugin';
import { ModelBase } from '../../../type-mongo/model-base';
import { getCustomerSchema } from '../../common/customer.schema';
import { parsePredifinedDate } from '../../common/date-range';
import { getEmployeeSchema } from '../../common/employee.schema';
import { getLocationSchema } from '../../common/location.schema';
import { getProductSchema } from '../../common/product.schema';
import { AppConnection } from '../app.connection';
import { IMapMarkerInput, ISaleByZip, ISaleDocument, ISaleModel, TypeMap } from './sale';


let Schema = mongoose.Schema;

let EntitySchema = {
    externalId: String,
    name: String,
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

const SaleReferralSchema = {
    ...EntitySchema,
    revenue: Number,
    revenueNoTax: Number,
};

let SalesSchema = new Schema ({
    source: String,
    externalId: { type: String, unique: true },
    billId: String,
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
    serviceType: String,
    referral: [SaleReferralSchema],
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

SaleSchema.plugin(criteriaPlugin);

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

SalesSchema.statics.amountByDateRange = function(fromDate: Date, toDate: Date): Promise<Object> {
    const SalesModel = (<ISaleModel>this);

    const from = moment(fromDate).utc().toDate();
    const to = moment(toDate).utc().toDate();

    return new Promise<Object>((resolve, reject) => {
        SalesModel.aggregate({ '$match': { 'product.from': { '$gte': from, '$lt': to } } },
                            { '$group': { '_id': { 'source': '$source', 'timestamp': '$timestamp' }, 'count': { '$sum': 1 }, 'amount': { '$sum': '$product.paid' } } })
        .then(sales => {
            resolve(sales);
        })
        .catch(err => {
            logger.error('There was an error retrieving sales by predefined data range', err);
            reject(err);
        });
    });
};

SalesSchema.statics.totalSalesByDateRange = function(fromDate: Date, toDate: Date): Promise<Object> {
    const SalesModel = (<ISaleModel>this);

    const from = moment(fromDate).utc().toDate();
    const to = moment(toDate).utc().toDate();

    return new Promise<Object>((resolve, reject) => {
        SalesModel.aggregate({ '$match': { 'product.from': { '$gte': from, '$lt': to } } },
                            { '$group': { '_id': null, 'count': { '$sum': 1 }, 'amount': { '$sum': '$product.paid' } } })
        .then(sales => {
            resolve(sales);
        })
        .catch(err => {
            logger.error('There was an error retrieving sales by predefined data range', err);
            reject(err);
        });
    });
};

SalesSchema.statics.monthsAvgSales = function(date: string): Promise<Object> {
    const SalesModel = (<ISaleModel>this);

    let _year = moment(date).utc().toDate().getUTCFullYear();
    let _month = moment(date).utc().toDate().getUTCMonth();

    if (_month === 0) {
        _year -= 1;
        _month = 12;
    }

    return new Promise<Object>((resolve, reject) => {
        SalesModel.aggregate({ '$group': { '_id': { 'year': { '$year': '$product.from' }, 'month': { '$month': '$product.from' } }, 'amount': { '$sum': '$product.paid' } } },
                        { '$match': { '_id.year': { '$lt': _year } , '_id.month': _month } } ,
                        { '$group': { '_id': { 'source': '$_id.month' }, 'amount': { '$avg': '$amount' } } })
        .then(sales => {
            resolve(sales);
        })
        .catch(err => {
            logger.error('There was an error retrieving sales by months of previous years ', err);
            reject(err);
        });
    });
};

SalesSchema.statics.salesEmployeeByDateRange = function(predefinedDateRange: string): Promise<Object> {
    const SalesModel = (<ISaleModel>this);

    const DateRange = parsePredifinedDate(predefinedDateRange);

    return new Promise<Object>((resolve, reject) => {
        SalesModel.aggregate({ '$match': { 'product.from': { '$gte': DateRange.from, '$lt': DateRange.to } } },
                            { '$group': { '_id': '$employee._id', 'amount': { '$sum': '$product.paid' } } },
                            { '$sort': { 'amount': 1 } },
                            { '$group': { '_id': null, 'employee': { '$last': '$_id'}, 'amount': { '$last': '$amount' } } })
        .then(sales => {
            resolve(sales);
        })
        .catch(err => {
            logger.error('There was an error retrieving employee sales by predefined data range', err);
            reject(err);
        });
    });
};

// TODO: // I need to fix UI maps because I removed GroupMap that was being used in findBy on the sales model.
// I need to change the ui so show the right group fields and also send the backend the group path ready to use

SalesSchema.statics.salesBy = function(type: TypeMap, input?: IMapMarkerInput): Promise<ISaleByZip[]> {
    const SalesModel = (<ISaleModel>this);
    let aggregate = [];

    return new Promise<ISaleByZip[]>((resolve, reject) => {
        switch (type) {
            case TypeMap.customerAndZip:
                aggregate.push(
                    { $match: { 'product.amount': { $gte: 0 } } },
                    { $project: { product: 1, _id: 0, customer: 1 } },
                    { $unwind: {} },
                    { $group: {
                        _id: { customerZip: '$customer.zip' },
                        sales: { $sum: '$product.amount' }
                        }
                    }
                );
                // check if input have value and is an object
                if (input && isObject(input)) {
                    // check if daterange has value
                    if (input.dateRange) {
                        let aggregateMatch = aggregate.find(agg => agg.$match !== undefined);
                        const dateRange = parsePredifinedDate(input.dateRange);

                        // check if i get object that has $match key and daterange is valid
                        if (aggregateMatch && moment(dateRange.from).isValid()) {
                            aggregateMatch.$match['product.from'] = {
                                $gte: dateRange.from,
                                $lt: dateRange.to
                            };
                        }
                    }

                    if (input.grouping) {
                        let groupFieldName = input.grouping.split('.')[0];
                        let aggregateGrouping = aggregate.find(agg => agg.$group !== undefined);
                        // get the field name for the sales document

                        if (aggregateGrouping) {
                            // assign empty object if $group._id is undefined
                            if (!aggregateGrouping.$group._id) {
                                aggregateGrouping.$group._id = {};
                            }
                            // i.e. $location.name, $product.itemDescription
                            aggregateGrouping.$group._id['grouping'] = '$' + input.grouping;
                        }

                        let aggregateUnwind = aggregate.find(agg => agg.$unwind !== undefined);
                        if (aggregateUnwind) {
                            const schemaFieldType = (SalesModel.schema as any).paths[groupFieldName].instance;
                            if (schemaFieldType === 'Array') {
                                aggregateUnwind.$unwind = {
                                    path: `$${groupFieldName}`,
                                    preserveNullAndEmptyArrays: true
                                };
                            } else {
                                delete aggregateUnwind.$unwind;
                                aggregate = filter(aggregate, (agg) => !isEmpty(agg));
                            }
                        }

                        // project the group field
                        let aggregateProject = aggregate.find(agg => agg.$project !== undefined);
                        if (aggregateProject) {
                            let projectFieldByGroup = groupFieldName;

                            aggregateProject.$project[projectFieldByGroup] = 1;
                        }
                    }
                }
                break;
            case TypeMap.productAndZip:
                break;
        }

        SalesModel.aggregate(aggregate).then(res => {
            if (!res) {
                resolve([]);
            }

            resolve(res as ISaleByZip[]);
        })
        .catch(err => reject(err));
    });
};

@injectable()
export class Sales extends ModelBase<ISaleModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Sale', SalesSchema, 'sales');
    }
}
