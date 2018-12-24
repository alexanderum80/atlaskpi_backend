import * as Bluebird from 'bluebird';

import { IChartWidgetAttributes, INumericWidgetAttributes, IWidget, IWidgetMaterializedFields } from './widget';

export interface IMaterializeOptions {
    timezone: string;
}

export interface IUIWidget extends UIWidgetBase {
    materialize(options: IMaterializeOptions): Promise<IUIWidget> | Bluebird<IUIWidget>;
}

export class UIWidgetBase {
    protected order: number;
    protected name: string;
    protected description?: string;
    protected type: string;
    protected size: string;
    protected color: string;
    protected fontColor: string;
    protected format?: string; // string interpolation ex: "${value}" | "{value} kms"
    protected numericWidgetAttributes?: INumericWidgetAttributes;
    protected chartWidgetAttributes?: IChartWidgetAttributes;
    protected dashboards?: string[];

    // virtual properties ( result of calcs, chart definitions, trending)
    materialized?: IWidgetMaterializedFields;
    protected tags: string[];

    constructor(protected widget: IWidget) {
        Object.assign(this, widget);
    }
}