import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';
import { criteriaPlugin } from '../../../app_modules/shared/criteria.plugin';
import { getCustomerSchema } from '../../common/customer.schema';
import { getLocationSchema } from '../../common/location.schema';
import { ModelBase } from './../../../type-mongo/model-base';
import { AppConnection } from './../app.connection';
import { IProjectedIncomeModel } from './projected-income';

const EntitySchema = {
    externalId: String,
    name: String
};


const MainReferralSchema = {
    ...EntitySchema,
    main: String
};

const ProjectedIncomeSchema = new mongoose.Schema({
    source: String,
    externalId: String,

    date: Date,
    scheduleDate: Date,

    hours: Number,

    // Money
    anesthesiaFee: Number,
    facilityFee: Number,
    inventoryFee: Number,
    outsideFee: Number,
    incomePreDiscount: Number,
    discount: Number,
    income: Number,
    prePayments: Number,

    appointmentType: String,
    resourceName: String,

    procedure: EntitySchema,
    location: getLocationSchema(),
    customer: getCustomerSchema(),
    provider: EntitySchema,
    coordinator: EntitySchema,
    referral: MainReferralSchema,
});


// INDEXES
ProjectedIncomeSchema.index({ 'date': 1 });
ProjectedIncomeSchema.index({ 'date': 1, 'appointmentType': 1 });
ProjectedIncomeSchema.index({ 'date': 1, 'resourceName': 1 });
ProjectedIncomeSchema.index({ 'date': 1, 'procedure.name': 1 });
ProjectedIncomeSchema.index({ 'date': 1, 'location.name': 1 });
ProjectedIncomeSchema.index({ 'date': 1, 'customer.fullname': 1 });
ProjectedIncomeSchema.index({ 'date': 1, 'provider.name': 1 });
ProjectedIncomeSchema.index({ 'date': 1, 'coordinator.name': 1 });
ProjectedIncomeSchema.index({ 'date': 1, 'referral.name': 1 });
ProjectedIncomeSchema.index({ 'date': 1, 'referral.main': 1 });

ProjectedIncomeSchema.plugin(criteriaPlugin);

@injectable()
export class ProjectedIncomes extends ModelBase<IProjectedIncomeModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'ProjectedIncome', ProjectedIncomeSchema, 'projectedIncome');
    }
}
