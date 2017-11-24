export class IntegrationFactory {
    static getInstance(): I {
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