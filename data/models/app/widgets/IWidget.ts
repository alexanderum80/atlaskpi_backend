import { IChart } from './../charts/IChart';
import { IChartDateRange } from './../../common/date-range';
import * as mongoose from 'mongoose';

export enum WidgetTypeEnum {
    Undefined,
    Numeric,
    Chart
}

export const WidgetTypeMap = {
    numeric: WidgetTypeEnum.Numeric,
    chart: WidgetTypeEnum.Chart
};

export function getWidgetTypePropName(type: WidgetTypeEnum) {
    switch (type) {
        case WidgetTypeEnum.Numeric:
            return 'numeric';
        case WidgetTypeEnum.Chart:
            return 'chart';
    }
}

export enum BestValueEnum {
    Undefined,
    None,
    Positive,
    Negative
}

export const BestValueMap = {
    none: BestValueEnum.None,
    positive: BestValueEnum.Positive,
    negative: BestValueEnum.Negative
};

export function getBestValuePropName(type: BestValueEnum) {
    switch (type) {
        case BestValueEnum.None:
            return 'none';
        case BestValueEnum.Positive:
            return 'positive';
        case BestValueEnum.Negative:
            return 'negative';
    }
}

export enum WidgetSizeEnum {
    Undefined,
    Small,
    Big
}

export const WidgetSizeMap = {
    small: WidgetSizeEnum.Small,
    big: WidgetSizeEnum.Big
};

export interface IChartWidgetAttributes {
    chart: string;
}

export interface INumericWidgetAttributes {
    kpi: string;
    dateRange: IChartDateRange;
    comparison?: [string];
    bestValue?: string;
    trending?: string;
}

export interface IWidget {
    order: number;
    name: string;
    description?: string;
    type: string;
    size: string;
    color: string;
    format?: string; // string interpolation ex: "${value}" | "{value} kms"
    numericWidgetAttributes?: INumericWidgetAttributes;
    chartWidgetAttributes?: IChartWidgetAttributes;

    // virtual properties ( result of calcs, chart definitions, trending)
    value?: number;
    direction?: string;
    trending?: any;
    chart?: string;
}

export interface IWidgetInput {
    order: number;
    name: string;
    description?: string;
    type: string;
    size: string;
    color: string;
    format?: string;
    numericWidgetAttributes?: INumericWidgetAttributes;
    chartWidgetAttributes?: IChartWidgetAttributes;
}

export interface IWidgetDocument extends IWidget, mongoose.Document { }

export interface IWidgetModel extends mongoose.Model<IWidgetDocument> {
    /**
     * retrieves all widgets
     * @returns {Promise<IWidgetDocument[]>}
     */
    listWidgets(): Promise<IWidgetDocument[]>;

    /**
     * Create a Widget
     * @param { IWidgetInput } input - and input object with the details of the widget
     * @returns {Promise<IWidgetDocument>}
     */
    createWidget(input: IWidgetInput): Promise<IWidgetDocument>;

    /**
     * Update a Widget
     * @param { String } id - the id of the widget you want to update
     * @param { IWidgetInput } input - and input object with the details of the widget
     * @returns { Promise<IWidgetDocument> }
     */
    updateWidget(id: string, input: IWidgetInput): Promise<IWidgetDocument>;

    /**
     * Remove a Widget by its id
     * @param { String } id - the id of the widget
     * @returns { Promise<IWidgetDocument> }
     */
    removeWidget(id: string): Promise<IWidgetDocument>;
}
