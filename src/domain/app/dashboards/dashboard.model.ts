import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { input } from '../../../framework/decorators/input.decorator';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IDashboardDocument, IDashboardInput, IDashboardModel } from './dashboard';
import { tagsPlugin } from '../tags/tag.plugin';
import { searchPlugin } from '../global-search/global-search.plugin';


let Schema = mongoose.Schema;

let AccessLevels = {
    users: [String],
    accessTypes: [String]
};

let DashboardSchema = new Schema({
    name: { type: String, unique: true, required: true },
    description: String,
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
    }],
    visible: Boolean,
});

// add tags capabilities
DashboardSchema.plugin(tagsPlugin);
DashboardSchema.plugin(searchPlugin);

DashboardSchema.statics.createDashboard = function(input: IDashboardInput):
    Promise < IDashboardDocument > {

        const that = < IDashboardModel > this;

        return new Promise < IDashboardDocument > ((resolve, reject) => {
            if (!input.name) {
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
            if (!id || !input.name) {
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

DashboardSchema.statics.updateVisibleDashboard = function(id: string, input: Boolean):
    Promise < IDashboardDocument > {

        const that = < IDashboardModel > this;

        return new Promise < IDashboardDocument > ((resolve, reject) => {
            if (!id) {
                return reject('Information not valid');
            }
            that.update({ _id: id }, {$set: { visible: input } }).then(dashboard => {
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

DashboardSchema.statics.findDashboardByChartId = function(id): Promise<string> {
    const DashboardModel = (<IDashboardModel>this);
    return new Promise<any>((resolve, reject) => {
        DashboardModel.findOne({ charts: { $in: [id] } }).distinct('name').then(dashboard => {
            resolve(dashboard[0]);
            return;
        }).catch(err => {
            logger.error(err);
            reject('there was an error getting a dashboard');
            return;
        });
    });
};

DashboardSchema.statics.deleteWidget = function(dashboardId: string, widgetId: string): Promise<IDashboardDocument> {
    const DashboardModel = (<IDashboardModel>this);

    return new Promise<IDashboardDocument>((resolve, reject) => {
        if (!dashboardId || !widgetId) {
            reject('no dashboardId or widgetId was provided');
            return;
        }

        DashboardModel.findById(dashboardId).then(dashboard => {
            if (dashboard.widgets && dashboard.widgets.length) {
                let widgets: any[] = dashboard.widgets;
                widgets = widgets.filter(widget => widget !== widgetId);

                dashboard.widgets = widgets;

                dashboard.save((err, dashboard) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(dashboard);
                    return;
                });
            }
        }).catch(err => {
            reject(err);
            return;
        });
    });
};

@injectable()
export class Dashboards extends ModelBase < IDashboardModel > {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Dashboard', DashboardSchema, 'dashboards');
    }
}