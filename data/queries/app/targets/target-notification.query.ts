import { IUserDocument } from '../../../models/app/users/IUser';
import { IDashboardModel } from '../../../models/app/dashboards/index';
import { IChartDocument, IChartModel } from '../../../models/app/charts/index';
import { INotify } from '../../../models/app/targets/ITarget';
import { IUserModel } from '../../../models/app/users/index';
import { IIdentity } from '../../../models/app/identity';
import { QueryBase } from '../..';
import * as Promise from 'bluebird';
import { PnsService } from '../../../services/pns/pns.service';
import { config } from '../../../../config';

export class TargetNotificationQuery extends QueryBase<any> {
    constructor(public identity: IIdentity,
                private _targetNotification: any,
                private _user: IUserModel,
                private _chart: IChartModel,
                private _dashboard: IDashboardModel) {
        super(identity);
    }

    run(data: { input: {usersId: string[], targetName: string, targetAmount: string,
                        targetDate: string, chartId: string, businessUnit: string}}): Promise<any> {
        const that = this;
        const input = data.input;

        const pnsService = new PnsService(config.pns);

        return new Promise<any>((resolve, reject) => {

            const chartQuery = that._chart.findById(input.chartId);
            const dashboardQuery = that._dashboard.findDashboardByChartId(input.chartId);
            const userQuery = that._user.findUsersById(input.usersId);

            Promise.all([chartQuery, dashboardQuery, userQuery])
                .spread((chart: IChartDocument, dashboard: string, users: IUserDocument[]) => {
                    // pass data to the notification
                    if (!chart || !dashboard || !users) {
                        reject({field: 'target notification', errors: 'inefficient data'});
                    }

                    const notifyData = {
                        targetName: input.targetName,
                        targetAmount: parseInt(input.targetAmount).toFixed(2),
                        targetDate: input.targetDate,
                        dashboardName: dashboard,
                        chartName: chart.title,
                        businessUnitName: input.businessUnit
                    };

                    const message = `Name: ${input.targetName}, amount: ${input.targetAmount}, date: ${input.targetDate}, chart: ${chart.title}`;

                    pnsService.sendNotifications(users, message);

                    users.forEach(user => that._targetNotification.notify(user, user.username, notifyData) );
                });

        });
    }
}