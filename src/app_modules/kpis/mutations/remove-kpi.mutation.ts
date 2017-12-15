import { IWidgetDocument } from '../../../domain/app/widgets/widget';
import { IChartDocument } from '../../../domain/app/charts/chart';
import { Widgets } from '../../../domain/app/widgets/widget.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Charts } from '../../../domain/app/charts/chart.model';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { RemoveKPIActivity } from '../activities/remove-kpi.activity';
import { KPIRemoveResponse } from '../kpis.types';


@injectable()
@mutation({
    name: 'removeKPI',
    activity: RemoveKPIActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: KPIRemoveResponse }
})
export class RemoveKpiMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject('KPIs') private _kpis: KPIs,
        @inject('Charts') private _charts: Charts,
        @inject('Widgets') private _widgets: Widgets
    ) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!data.id) {
                return reject({ success: false,
                                errors: [ { field: 'id', errors: ['Chart not found']} ] });
            }
            let findCharts = this._charts.model.find({ kpis: { $in: [data.id] } })
                .populate('kpis', '-_id, name')
                .then(kpis => {
                    if (kpis) {
                        return kpis;
                    }
                });

            let findWidgets = this._widgets.model.find({
                'numericWidgetAttributes.kpi': data.id
            })
            .populate('kpis', '-_id, name')
            .then(kpis => {
                if (kpis) {
                    return kpis;
                }
            });

            let documentExists: any = {};
            return Promise.all([findCharts, findWidgets])
                .spread((chart: IChartDocument[], widget: IWidgetDocument[]) => {
                    documentExists.chart = chart;
                    documentExists.widget = widget;
                    return that._kpis.model.removeKPI(data.id, documentExists).then(foundDocument => {
                        resolve({ success: true, entity: foundDocument });
                        return;
                    });
                }).catch(err => {
                    resolve({ success: false, entity: err.entity, errors: [ { field: 'kpi', errors: [err.error]}]});
                    return;
                });
        });
    }
}
