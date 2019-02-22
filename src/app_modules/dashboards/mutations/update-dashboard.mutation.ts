import { Widgets } from './../../../domain/app/widgets/widget.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateDashboardActivity } from '../activities/update-dashboard.activity';
import { DashboardInput, DashboardResponse } from '../dashboards.types';
import { DashboardQuery } from '../queries/dashboard.query';
import { Maps } from '../../../domain/app/maps/maps.model';
import { attachDashboardToMap, detachDashboardFromAllMaps } from '../../maps/mutations/common';


@injectable()
@mutation({
    name: 'updateDashboard',
    activity: UpdateDashboardActivity,
    invalidateCacheFor: [ DashboardQuery ],
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: DashboardInput, required: true },
    ],
    output: { type: DashboardResponse }
})
export class UpdateDashboardMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Dashboards.name) private _dashboards: Dashboards,
                @inject(Maps.name) private _maps: Maps) {
        super();
    }

    run(data: { id: string, input: DashboardInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            let widgets = [];
            let charts = [];
            let socialwidgets = [];
            let maps = [];
            let dataInput = [];
            if (data.input.widgets) {
                widgets = data.input.widgets.map(wt => JSON.parse(wt));
            }
            data.input['widgets'] = widgets;
            if (data.input.socialwidgets) {
                socialwidgets = data.input.socialwidgets.map(swt => JSON.parse(swt));
            }
            data.input['socialwidgets'] = socialwidgets;
            if (data.input.charts) {
                charts = data.input.charts.map(ct => JSON.parse(ct));
            }
            data.input['charts'] = charts;
            if (data.input.maps) {
                maps = data.input.maps.map(mt => JSON.parse(mt));
            }
            data.input['maps'] = maps;
            that._dashboards.model.updateDashboard(data.id, <any>data.input).then(dashboard => {
               
                detachDashboardFromAllMaps(this._maps.model, dashboard.id)
                .then( (res) =>
                {
                    if(res && maps.length){
                        const mapsToUpdate =  maps.map( obj => obj.id);
                        attachDashboardToMap(this._maps.model, mapsToUpdate, dashboard.id);
                    }
                })
               
                resolve({
                    success: true,
                    entity: null
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error updating the dashboard']
                        }
                    ]
                });
            });
        });
    }
}
