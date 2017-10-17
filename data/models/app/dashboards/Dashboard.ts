import { IDashboardDocument } from './';
import { IDashboardModel } from './IDashboard';
import { IChartDocument } from '../charts';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as logger from 'winston';

let Schema = mongoose.Schema;

let DashboardSchema = new Schema({
    name: String,
    description: String,
    group: String,
    charts: [{ type: Schema.Types.String, ref: 'Chart' }],
    owner: { type: Schema.Types.String, ref: 'User' },
    users: [{ type: Schema.Types.String, ref: 'User' }]
});

// DashboardSchema.methods.

// DashboardSchema.statics.

DashboardSchema.statics.createDashboard = function(name: string, description: string, group: string, charts: string[], users: string[]):
    Promise<IDashboardDocument> {

    const that = <IDashboardModel> this;

    return new Promise<IDashboardDocument>((resolve, reject) => {
        if (!name || !description || !group) {
            return reject('Information not valid');
        }

        const newDashboardData = {
            name: name,
            description: description,
            group: group,
            charts: charts
        };

        if (users && users.length) {
            newDashboardData['users'] = users;
        }

        that.create(newDashboardData).then(dashboard => {
            resolve(dashboard);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the dashboard');
        });
    });
};

DashboardSchema.statics.updateDashboard = function(_id: string, name: string, description: string, group: string, charts: string[], users: string[]):
    Promise<IDashboardDocument> {

    const that = <IDashboardModel> this;

    return new Promise<IDashboardDocument>((resolve, reject) => {
        if (!_id || !name || !description || !group || !charts) {
            return reject('Information not valid');
        }

        const updateDashboardData = {
            name: name,
            description: description,
            group: group,
            charts: charts
        };

        if (users && users.length) {
            updateDashboardData['users'] = [];
            updateDashboardData['users'] = users;
        }

        that.findByIdAndUpdate(_id, updateDashboardData).then(dashboard => {
            resolve(dashboard);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the dashboard');
        });
    });
};

DashboardSchema.statics.deleteDashboard = function(_id: string):
Promise<IDashboardDocument> {

const that = <IDashboardModel> this;

return new Promise<IDashboardDocument>((resolve, reject) => {
    if (!_id) {
        return reject('Information not valid');
    }

    that.findByIdAndRemove(_id).then(dashboard => {
        resolve(dashboard);
    }).catch(err => {
        logger.error(err);
        reject('There was an error deleting the dashboard');
    });
});
};

export function getDashboardModel(m: mongoose.Connection): IDashboardModel {
    return <IDashboardModel>m.model('Dashboard', DashboardSchema, 'dashboards');
}