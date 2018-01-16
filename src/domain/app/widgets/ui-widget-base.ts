import * as Promise from 'bluebird';

import { IChartWidgetAttributes, INumericWidgetAttributes, IWidget, IWidgetMaterializedFields } from './widget';


export interface IUIWidget extends UIWidgetBase {
    materialize(): Promise<IUIWidget>;
}

export class UIWidgetBase {
    protected order: number;
    protected name: string;
    protected description?: string;
    protected type: string;
    protected size: string;
    protected color: string;
    protected format?: string; // string interpolation ex: "${value}" | "{value} kms"
    protected numericWidgetAttributes?: INumericWidgetAttributes;
    protected chartWidgetAttributes?: IChartWidgetAttributes;

    // virtual properties ( result of calcs, chart definitions, trending)
    materialized?: IWidgetMaterializedFields;

    constructor(protected widget: IWidget) {
        Object.assign(this, widget);
    }
}