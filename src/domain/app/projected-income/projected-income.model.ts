import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import { criteriaPlugin } from '../../../app_modules/shared/criteria.plugin';
import { ModelBase } from './../../../type-mongo/model-base';
import { AppConnection } from './../app.connection';
import { IProjectedIncomeModel } from './projected-income';

const ProjectedIncomeSchema = new mongoose.Schema({}, { strict: false });

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
