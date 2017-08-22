import { IDashboardModel } from './IDashboard';
import { IChartDocument } from '../charts';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

let Schema = mongoose.Schema;

let DashboardSchema = new Schema({
    name: String,
    group: String,
    charts: [{ type: Schema.Types.String, ref: 'Chart' }]
});

// DashboardSchema.methods.

// DashboardSchema.statics.

export function getDashboardModel(m: mongoose.Connection): IDashboardModel {
    return <IDashboardModel>m.model('Dashboard', DashboardSchema, 'dashboards');
}