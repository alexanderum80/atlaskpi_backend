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
import { VirtualSources } from '../virtual-sources/virtual-source.model';


@injectable()
export class WidgetFactory {

    constructor(
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(Charts.name) private _charts: Charts,
        @inject(Sales.name) private _sales: Sales,
        @inject(Expenses.name) private _expenses: Expenses,
        @inject(KpiFactory.name) private _kpiFactory: KpiFactory,
        @inject(ChartFactory.name) private _chartFactory: ChartFactory,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources
    ) { }

    async getInstance(widget: IWidget): Promise<IUIWidget> {
        const virtualSources = await this._virtualSources.model.find({});

        switch (WidgetTypeMap[widget.type]) {
            case WidgetTypeEnum.Chart:
                return new ChartWidget(widget, this._kpiFactory, this._chartFactory, this._charts, this._sales, this._expenses, this._kpis, virtualSources);
            case WidgetTypeEnum.Numeric:
                return new NumericWidget(widget, this._kpiFactory, this._kpis, virtualSources);
            default:
                return null;
        }
    }
}