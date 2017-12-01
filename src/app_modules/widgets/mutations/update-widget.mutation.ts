import { IKPIModel } from '../../../models/app/kpis';
import { IDashboardModel } from './../../../models/app/dashboards/IDashboard';
import { IWidgetModel } from '../../../models/app/widgets';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';

export class UpdateWidgetMutation extends MutationBase<IMutationResponse> {

    constructor(
        public identity: IIdentity,
        private _widgetModel: IWidgetModel,
        private _kpiModel: IKPIModel,
        private _dashboardModel: IDashboardModel
    ) {
        super(identity);
    }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._widgetModel.updateWidget(data.id, data.input)
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