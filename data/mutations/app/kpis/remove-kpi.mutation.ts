import { IDocumentExist } from '../../../models/app/kpis/index';
import { IChartDocument } from '../../../models/app/charts/index';
import { IWidgetDocument, IWidgetModel } from '../../../models/app/widgets/index';
import { MutationBase } from '../../mutation-base';
import { IMutationResponse } from '../../../models/common';
import * as Promise from 'bluebird';
import { IIdentity, IKPIModel, IChartModel } from '../../..';
import { IMutation, IValidationResult } from '../..';


export class RemoveKPIMutation extends MutationBase<IMutationResponse> {

    constructor(public identity: IIdentity,
                private _KPIModel: IKPIModel,
                private _ChartModel?: IChartModel,
                private _WidgetModel?: IWidgetModel) {
                    super(identity);
                }

    // log = true;
    // audit = true;

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!data.id) {
                return reject({ success: false,
                                errors: [ { field: 'id', errors: ['Chart not found']} ] });
            }
            let findCharts = this._ChartModel.find({ kpis: { $in: [data.id] } })
                .populate('kpis', '-_id, name')
                .then(kpis => {
                    if (kpis) {
                        return kpis;
                    }
                });
            let findWidgets = this._WidgetModel.find({
                'numericWidgetAttributes.kpi': data.id
            })
            .populate('kpis', '-_id, name')
            .then(kpis => {
                if (kpis) {
                    return kpis;
                }
            });
            let documentExists: IDocumentExist = {};
            return Promise.all([findCharts, findWidgets])
                .spread((chart: IChartDocument, widget: IWidgetDocument) => {
                    documentExists.chart = chart;
                    documentExists.widget = widget;
                    return that._KPIModel.removeKPI(data.id, documentExists).then(foundDocument => {
                        return resolve({ success: true, entity: foundDocument});
                    });
                }).catch(err => {
                    resolve({ success: false, entity: err.entity, errors: [ { field: 'kpi', errors: [err.error]}]});
                    return;
                });
            // let promises = findCharts;

            // return Promise.all(promises).then(chartExists => {
            //     return this._KPIModel.removeKPI(data.id, chartExists).then(chart => {
            //         const listCharts = Array.isArray(chart) ? chart : [chart];
            //         return resolve({ success: true, entity: listCharts});
            //     });
            // }).catch(err => {
            //     resolve({ success: false, entity: err.entity, errors: [ { field: 'kpi', errors: [err.error]}]});
            // });
        });
    }
}
