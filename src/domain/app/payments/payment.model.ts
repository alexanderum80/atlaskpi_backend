import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { criteriaPlugin } from '../../../app_modules/shared/criteria.plugin';
import { getCustomerSchema } from '../../common/customer.schema';
import { getLocationSchema } from '../../common/location.schema';
import { ModelBase } from './../../../type-mongo/model-base';
import { AppConnection } from './../app.connection';
import { IPaymentModel } from './payment';

const EntitySchema = {
    externalId: String,
    name: String
};

const PaymentInvoiceSchema = {
    ...EntitySchema,
    date: Date,
    subtotal: Number,
    tax: Number,
    discount: Number,
    total: Number,
};

export const PaymentSchema = new mongoose.Schema({
    source: String,
    externalId: String,
    invoice: PaymentInvoiceSchema,
    location: (<any>getLocationSchema()),
    customer: (<any>getCustomerSchema()),
    seller: EntitySchema,
    provider: EntitySchema,
    coordinator: EntitySchema,
    paymentType: EntitySchema,
    paymentMethod: EntitySchema,
    timestamp: Date,
    percentaje: Number,
    amount: Number,
    paymentTotalAmount: Number,
    description: String,
    prePayment: Boolean,
    chargeId: String
});

// INDEXES
PaymentSchema.index({ 'timestamp': 1 });
PaymentSchema.index({ 'timestamp': 1, 'invoice.name': 1 });
PaymentSchema.index({ 'timestamp': 1, 'location.name': 1 });
PaymentSchema.index({ 'timestamp': 1, 'customer.name': 1 });
PaymentSchema.index({ 'timestamp': 1, 'seller.name': 1 });
PaymentSchema.index({ 'timestamp': 1, 'provider.name': 1 });
PaymentSchema.index({ 'timestamp': 1, 'coordinator.name': 1 });
PaymentSchema.index({ 'timestamp': 1, 'paymentType.name': 1 });
PaymentSchema.index({ 'timestamp': 1, 'paymentMethod.name': 1 });

PaymentSchema.plugin(criteriaPlugin);

@injectable()
export class Payments extends ModelBase<IPaymentModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Payment', PaymentSchema, 'payments');
    }
}
