import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { criteriaPlugin } from '../../../app_modules/shared/criteria.plugin';
import { getCustomerSchema } from '../../common/customer.schema';
import { getLocationSchema } from '../../common/location.schema';
import { ModelBase } from './../../../type-mongo/model-base';
import { AppConnection } from './../app.connection';
import { IFinancialActivityModel } from './financial-activity';

const EntitySchema = {
    externalId: String,
    name: String
};

const FinancialActivitySchema = new mongoose.Schema({
    source: String,
    externalId: String,

    location: getLocationSchema(),
    customer: getCustomerSchema(),
    provider: EntitySchema,
    category: EntitySchema,
    service: EntitySchema,

    inputDate: Date,
    billDate: Date,
    serviceDate: Date,
    type: { type: String },

    adjustment: Number,
    appPrepay: Number,
    appToPrepay: Number,
    bill: Number,
    cash: Number,
    charge: Number,
    check: Number,
    credit: Number,
    gcSold: Number,
    gcRedeemed: Number,
    prePayment: Number,
    netPayments: Number,
    refundCash: Number,
    refundCheck: Number,
    refundCredit: Number,
    refundGC: Number,
    totalPayments: Number,
    totalRefunds: Number
});

FinancialActivitySchema.plugin(criteriaPlugin);

// INDEXES
FinancialActivitySchema.index({ 'billDate': 1 });
FinancialActivitySchema.index({ 'billDate': 1, 'customer.fullname': 1 });
FinancialActivitySchema.index({ 'billDate': 1, 'location.name': 1 });
FinancialActivitySchema.index({ 'billDate': 1, 'provider.name': 1 });
FinancialActivitySchema.index({ 'billDate': 1, 'category.name': 1 });
FinancialActivitySchema.index({ 'billDate': 1, 'service.name': 1 });
FinancialActivitySchema.index({ 'inputDate': 1 });
FinancialActivitySchema.index({ 'inputDate': 1, 'customer.fullname': 1 });
FinancialActivitySchema.index({ 'inputDate': 1, 'location.name': 1 });
FinancialActivitySchema.index({ 'inputDate': 1, 'provider.name': 1 });
FinancialActivitySchema.index({ 'inputDate': 1, 'category.name': 1 });
FinancialActivitySchema.index({ 'inputDate': 1, 'service.name': 1 });
FinancialActivitySchema.index({ 'serviceDate': 1 });
FinancialActivitySchema.index({ 'serviceDate': 1, 'customer.fullname': 1 });
FinancialActivitySchema.index({ 'serviceDate': 1, 'location.name': 1 });
FinancialActivitySchema.index({ 'serviceDate': 1, 'provider.name': 1 });
FinancialActivitySchema.index({ 'serviceDate': 1, 'category.name': 1 });
FinancialActivitySchema.index({ 'serviceDate': 1, 'service.name': 1 });

@injectable()
export class FinancialActivities extends ModelBase<IFinancialActivityModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'FinancialActivity', FinancialActivitySchema, 'financialActivities');
    }
}