import { inject, injectable } from 'inversify';

import { ChartFactory } from '../../../app_modules/charts/queries/charts/chart-factory';
import { KpiFactory } from '../../../app_modules/kpis/queries/kpi.factory';
import { Charts } from '../charts/chart.model';
import { Expenses } from '../expenses/expense.model';
import { KPIs } from '../kpis/kpi.model';
import { Sales } from '../sales/sale.model';
import { ChartWidget } from './chart-widget';
import { NumericWidget } from './numeric-widget';
import { IUIWidget } from './ui-widget-base';
import { IWidget, WidgetTypeEnum, WidgetTypeMap } from './widget';


@injectable()
export class WidgetFactory {

    constructor(
        @inject('KPIs') private _kpis: KPIs,
        @inject('Charts') private _charts: Charts,
        @inject('Sales') private _sales: Sales,
        @inject('Expenses') private _expenses: Expenses,
        @inject('KpiFactory') private _kpiFactory: KpiFactory,
        @inject('ChartFactory') private _chartFactory: ChartFactory,
    ) { }

    getInstance(widget: IWidget): IUIWidget {
        switch (WidgetTypeMap[widget.type]) {
            case WidgetTypeEnum.Chart:
                return new ChartWidget(widget, this._kpiFactory, this._chartFactory, this._charts, this._sales, this._expenses, this._kpis);
            case WidgetTypeEnum.Numeric:
                return new NumericWidget(widget, this._kpiFactory, this._kpis);
            default:
                return null;
        }
    }
}