import { KPIs } from '../kpis/kpi.model';
import { Charts } from '../charts';
import { Expenses } from '../expenses';
import { Sales } from '../sales';
import { NumericWidget } from './numeric-widget';
import { ChartWidget } from './chart-widget';
import { IWidget, WidgetTypeEnum, WidgetTypeMap } from './';
import { IUIWidget } from './ui-widget-base';

export class WidgetFactory {
    static getInstance(widget: IWidget, charts: Charts, sales: Sales, expenses: Expenses, kpis: KPIs): IUIWidget {
        switch (WidgetTypeMap[widget.type]) {
            case WidgetTypeEnum.Chart:
                return new ChartWidget(charts, sales, expenses, kpis);
            case WidgetTypeEnum.Numeric:
                return new NumericWidget(charts, sales, expenses, kpis);
            default:
                return null;
        }
    }
}