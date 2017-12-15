import * as Promise from 'bluebird';
import { cloneDeep } from 'lodash';

import { IKpiBase } from '../../../app_modules/kpis/queries/kpi-base';
import { KpiFactory } from '../../../app_modules/kpis/queries/kpi.factory';
import {
    getComparisonDateRanges,
    getDateRangeIdFromString,
    IChartDateRange,
    IDateRange,
    parsePredifinedDate,
    PredefinedComparisonDateRanges,
} from '../../common/date-range';
import { KPIs } from '../kpis/kpi.model';
import { IUIWidget, UIWidgetBase } from './ui-widget-base';
import {
    ComparisonDirectionArrowEnum,
    ComparisonDirectionArrowMap,
    IMaterializedComparison,
    IWidget,
    IWidgetMaterializedFields,
} from './widget';


export class NumericWidget extends UIWidgetBase implements IUIWidget {

    private kpi: IKpiBase;

    // TODO: Refactor
    constructor(
        widget: IWidget,
        private _kpiFactory: KpiFactory,
        private _kpis: KPIs
        ) {
        super(widget);
    }

    materialize(): Promise<IUIWidget> {
        Object.assign(this, this.widget);

        if (!this.numericWidgetAttributes || !this.numericWidgetAttributes.kpi) {
            console.log('A numeric Widget cannot live without a kpi');
            return null;
        }

        const that = this;

        const dateRange = this._processChartDateRange(this.numericWidgetAttributes.dateRange);
        const comparison = getComparisonDateRanges([this.numericWidgetAttributes.dateRange], this.numericWidgetAttributes.comparison);

        return new Promise<IUIWidget>((resolve, reject) => {
            that._resolveKpi().then((resolvedKpi) => {
                if (!resolvedKpi) {
                    reject('could not resolve a kpi');
                    return;
                }

                if (!this.numericWidgetAttributes.dateRange) {
                    console.log('cannot materialize a numeric widget if there is no kpi or dateRange');
                    return null;
                }

                const widgetPromises = {
                    main: that._getKpiData(resolvedKpi, dateRange)
                };

                comparison.forEach((comparisonDateRange, index) => {
                    widgetPromises[that.numericWidgetAttributes.comparison[index]] = that._getKpiData(resolvedKpi, comparisonDateRange);
                });

                Promise.props(widgetPromises).then(output => {
                    resolve(that._generateUIWidgetFromPromisesOutput(output, this.numericWidgetAttributes.dateRange));
                    return;
                });
            })
            .catch(err => reject(err));
        });
    }

    private _resolveKpi(): Promise<IKpiBase> {
        const that = this;

        return new Promise<IKpiBase>((resolve, reject) => {
            this._kpis.model.findOne({_id: that.numericWidgetAttributes.kpi })
            .then(kpiDocument => {
                const kpi = that._kpiFactory.getInstance(kpiDocument);
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

    private _getKpiData(kpi: IKpiBase, dateRange: IDateRange): Promise<any> {
        const kpiClone = cloneDeep(kpi);

        const that = this;
        return new Promise<any>((resolve, reject) => {
            return kpiClone.getData([dateRange], { filter: null }).then(result => {
                if (result && result.length > 0) {
                    console.log(`value recieved for widget(${that.name}): ${result[0].value}`);
                    return resolve(result[0].value);
                }
                console.log(`value not recieved for widget(${that.name}), displaying 0 as value`);
                return resolve(0);
            })
            .catch(err => reject(err));
        });
    }

    private _generateUIWidgetFromPromisesOutput(output, widgetDateRange: IChartDateRange): IUIWidget {
        const value = Number(output['main']);
        const comparisonsIds = Object.keys(output).filter(d => d !== 'main');
        const compareValue = Number(output[comparisonsIds[0]]) || 0;

        let comparisonValue: string;
        let comparisonDirection: string;
        let comparisonObject: IMaterializedComparison;

        if (comparisonsIds.length) {
            const dateRangeId = getDateRangeIdFromString(widgetDateRange.predefined);
            const comparisonString = PredefinedComparisonDateRanges[dateRangeId][comparisonsIds[0]];
            comparisonObject = { period: comparisonString, value: compareValue };
        }

        if (comparisonObject &&
            this.numericWidgetAttributes.comparisonArrowDirection &&
            this.numericWidgetAttributes.comparisonArrowDirection !== 'none') {
                comparisonObject.arrowDirection = this._getComparisonDirection(value, compareValue);
        }

        const materialized: IWidgetMaterializedFields = {
            value: value,
            comparison:  comparisonObject
        };

        const result = Object.assign({}, this.widget, { materialized: materialized });

        return <any>result;
    }

    private _getComparisonDirection(value: number, compareValue: number): string {
        switch (ComparisonDirectionArrowMap[this.numericWidgetAttributes.comparisonArrowDirection]) {
            case ComparisonDirectionArrowEnum.Down:
                if (value - compareValue > 0) {
                    return 'down';
                } else if (value - compareValue < 0) {
                    return 'up';
                }
                return null;

            case ComparisonDirectionArrowEnum.Up:
                if (value - compareValue < 0) {
                    return 'down';
                } else if (value - compareValue > 0) {
                    return 'up';
                }
                return null;

            default:
                return null;
        }
    }

}