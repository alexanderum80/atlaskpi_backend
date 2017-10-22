import { IUIChart } from '../../../queries/app/charts/charts';
import { IChartDateRange, IDateRange, parsePredifinedDate } from '../../common';
import { IKpiBase } from './../../../queries/app/kpis/kpi-base';
import { IAppModels } from '../app-models';
import { KpiFactory } from './../../../queries/app/kpis/kpi.factory';
import { IWidget } from './IWidget';
import { IUIWidget, UIWidgetBase } from './ui-widget-base';

export class NumericWidget extends UIWidgetBase implements IUIWidget {

    private kpi: IKpiBase;

    constructor(widget: IWidget, ctx: IAppModels) {
        super(widget, ctx);
        if (!this.numericWidgetAttributes || !this.numericWidgetAttributes.kpi) {
            console.log('A numeric Widget cannot live without a kpi');
            return null;
        }
    }

    materialize(): Promise<IUIWidget> {
        const that = this;

        const dateRange = this._processChartDateRange(this.numericWidgetAttributes.dateRange);

        return new Promise<IUIChart>((resolve, reject) => {
            that._resolveKpi().then((resolvedKpi) => {
                if (!resolvedKpi) {
                    reject('could not resolve a kpi');
                    return;
                }

                if (!this.numericWidgetAttributes.dateRange) {
                    console.log('cannot materialize a numeric widget if there is no kpi or dateRange');
                    return null;
                }

                resolvedKpi.getData([dateRange], { filter: null }).then(result => {
                    if (result && result.length > 0) {
                        console.log(`value recieved for widget(${that.name}): ${result[0].value}`);
                        that.value = result[0].value;
                        resolve(that);
                        return;
                    }
                    console.log(`value not recieved for widget(${that.name}), displaying 0 as value`);
                    that.value = 0;
                    return resolve(that);
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }

    private _resolveKpi(): Promise<IKpiBase> {
        const that = this;

        return new Promise<IKpiBase>((resolve, reject) => {
            this.ctx.KPI.findOne({_id: that.numericWidgetAttributes.kpi })
            .then(kpiDocument => {
                const kpi = KpiFactory.getInstance(kpiDocument, that.ctx);
                if (kpi) {
                    resolve(kpi);
                    return;
                }
                console.log('could not resolve a kpi from the factory');
                return resolve(null);
            })
            .catch(err => reject(err));
        });
    }

    private _processChartDateRange(chartDateRange: IChartDateRange): IDateRange {
        return chartDateRange.custom && chartDateRange.custom.from ?
                { from: new Date(chartDateRange.custom.from), to: new Date(chartDateRange.custom.to) }
                : parsePredifinedDate(chartDateRange.predefined);
    }

    materializedValue(): string {
        return String(this.value);
    }

}