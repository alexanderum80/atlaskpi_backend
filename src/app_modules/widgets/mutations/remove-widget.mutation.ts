import { IDashboardModel } from './../../../models/app/dashboards/IDashboard';
import { IWidgetModel } from '../../../models/app/widgets';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation } from '../..';
import * as Promise from 'bluebird';

export class RemoveWidgetMutation extends MutationBase<IMutationResponse> {

    constructor(
        public identity: IIdentity,
        private _widgetModel: IWidgetModel,
        private _dashboardModel: IDashboardModel
    ) {
        super(identity);
    }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._widgetModel.removeWidget(data.id)
                             .then(widget =>  {
                                 resolve({ entity: widget, success: true });
                                 return;
                             })
                             .catch(err => {
                                 resolve({success: false, errors: [{ field: 'widget', errors: [err]} ]});
                                 return;
                             });
        });
    }

}