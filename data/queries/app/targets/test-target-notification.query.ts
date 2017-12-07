import { IUserDocument } from '../../../models/app/users/IUser';
import { IDashboardModel } from '../../../models/app/dashboards/index';
import { IChartDocument, IChartModel } from '../../../models/app/charts/index';
import { INotify } from '../../../models/app/targets/ITarget';
import { IUserModel } from '../../../models/app/users/index';
import { IIdentity } from '../../../models/app/identity';
import { QueryBase } from '../..';
import * as Promise from 'bluebird';

export class TestTargetNotificationQuery extends QueryBase<any> {
    constructor(public identity: IIdentity,
                private _testNotification: any,
                private _user: IUserModel,
                private _chart: IChartModel,
                private _dashboard: IDashboardModel) {
        super(identity);
    }

    // needs: targetName, targetAmount (target), targetDate (datepicker), dashboard name, chartName

    run(data: { input: {usersId: string[], targetName: string, targetAmount: string,
                        targetDate: string, chartId: string, businessUnit: string}}): Promise<any> {
        const that = this;
        const input = data.input;
        return new Promise<any>((resolve, reject) => {
            // query chart to get chart name
            // use chart id to get the dashboard name

            const chartQuery = that._chart.findById(input.chartId);
            const dashboardQuery = that._dashboard.findDashboardByChartId(input.chartId);
            const userQuery = that._user.findUsersById(input.usersId);

            Promise.all([chartQuery, dashboardQuery, userQuery])
                .spread((chart: IChartDocument, dashboard: string, users: IUserDocument[]) => {
                    // pass data to the notification
                    if (!chart || !dashboard || !users) {
                        reject({field: 'target notification', errors: 'inefficient data'});
                    }
                    users.forEach(user => {
                        const notifyData = {
                            targetName: input.targetName,
                            targetAmount: parseInt(input.targetAmount).toFixed(2),
                            targetDate: input.targetDate,
                            dashboardName: dashboard,
                            chartName: chart.title,
                            businessUnitName: input.businessUnit
                        };
                        that._testNotification.notify(user, user.username, notifyData);
                    });
                });

        });
    }
}