import { IAppModels } from './../app-models';
import { NumericWidget } from './numeric-widget';
import { ChartWidget } from './chart-widget';
import { WidgetTypeEnum, WidgetTypeMap } from './';
import { IUIWidget } from './ui-widget-base';
import { IWidget } from './IWidget';

export class WidgetFactory {
    static getInstance(widget: IWidget, ctx: IAppModels): IUIWidget {
        switch (WidgetTypeMap[widget.type]) {
            case WidgetTypeEnum.Chart:
                return new ChartWidget(widget, ctx);
            case WidgetTypeEnum.Numeric:
                return new NumericWidget(widget, ctx);
            default:
                return null;
        }
    }
}