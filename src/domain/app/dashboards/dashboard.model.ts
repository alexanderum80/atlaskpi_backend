import {
    ModelBase
} from '../../../type-mongo';
import {
    AppConnection
} from '../app.connection';
import {
    injectable,
    inject
} from 'inversify';
import {
    IDashboardDocument
} from './';
import {
    IDashboardModel,
    IDashboardInput
} from './dashboard';
import {
    IChartDocument
} from '../charts';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as logger from 'winston';

let Schema = mongoose.Schema;

let DashboardSchema = new Schema({
    name: String,
    description: String,
    group: String,
    charts: [{
        type: Schema.Types.String,
        ref: 'Chart'
    }],
    widgets: [{
        type: Schema.Types.String,
        ref: 'Widget'
    }],
    owner: {
        type: Schema.Types.String,
        ref: 'User'
    },
    users: [{
        type: Schema.Types.String,
        ref: 'User'
    }]
});

// DashboardSchema.methods.

// DashboardSchema.statics.

DashboardSchema.statics.createDashboard = function(input: IDashboardInput):
    Promise < IDashboardDocument > {

        const that = < IDashboardModel > this;

        return new Promise < IDashboardDocument > ((resolve, reject) => {
            if (!input.name || !input.group) {
                return reject('Information not valid');
            }

            that.create(input).then(dashboard => {
                resolve(dashboard);
            }).catch(err => {
                logger.error(err);
                reject('There was an error adding the dashboard');
            });
        });
    };

DashboardSchema.statics.updateDashboard = function(id: string, input: IDashboardInput):
    Promise < IDashboardDocument > {

        const that = < IDashboardModel > this;

        return new Promise < IDashboardDocument > ((resolve, reject) => {
            if (!id || !input.name || !input.group) {
                return reject('Information not valid');
            }

            that.findByIdAndUpdate(id, input).then(dashboard => {
                resolve(dashboard);
                return;
            }).catch(err => {
                logger.error(err);
                return reject('There was an error updating the dashboard');
            });
        });
    };

DashboardSchema.statics.deleteDashboard = function(id: string):
    Promise < IDashboardDocument > {

        const that = < IDashboardModel > this;

        return new Promise < IDashboardDocument > ((resolve, reject) => {
            if (!id) {
                return reject('Information not valid');
            }

            that.findByIdAndRemove(id).then(dashboard => {
                resolve(dashboard);
                return;
            }).catch(err => {
                logger.error(err);
                reject('There was an error deleting the dashboard');
            });
        });
    };

@injectable()
export class Dashboards extends ModelBase < IDashboardModel > {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Dashboard', DashboardSchema, 'dashboards');
    }
}