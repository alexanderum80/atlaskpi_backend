import { ISearchableModel } from '../global-search/global-search';
import * as mongoose from 'mongoose';

import { input } from '../../../framework/decorators/input.decorator';
import { IChartDateRange } from './../../common/date-range';

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

export enum ComparisonDirectionArrowEnum {
    Undefined,
    None,
    Up,
    Down
}

export const ComparisonDirectionArrowMap = {
    none: ComparisonDirectionArrowEnum.None,
    up: ComparisonDirectionArrowEnum.Up,
    down: ComparisonDirectionArrowEnum.Down
};

export function getComparisonDirectionArrow(type: ComparisonDirectionArrowEnum) {
    switch (type) {
        case ComparisonDirectionArrowEnum.None:
            return 'none';
        case ComparisonDirectionArrowEnum.Up:
            return 'up';
        case ComparisonDirectionArrowEnum.Down:
            return 'down';
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
    comparisonArrowDirection?: string;
    trending?: string;
    format?: string; // string interpolation ex: "${value}" | "{value} kms"
}

export interface IMaterializedComparison {
    period: string;
    value: number;
    arrowDirection?: string;
}

export interface IWidgetMaterializedFields {
    value?: number;
    comparison?: IMaterializedComparison;
    trending?: any;
    chart?: string;
}

export interface IWidget {
    order: number;
    name: string;
    description?: string;
    type: string;
    size: string;
    color: string;
    numericWidgetAttributes?: INumericWidgetAttributes;
    chartWidgetAttributes?: IChartWidgetAttributes;
    dashboards?: string[];

    // virtual properties ( result of calcs, chart definitions, trending)
    materialized?: IWidgetMaterializedFields;
    tags: string[];
}

export interface IWidgetInput {
    order: number;
    name: string;
    description?: string;
    type: string;
    size: string;
    color: string;
    numericWidgetAttributes?: INumericWidgetAttributes;
    chartWidgetAttributes?: IChartWidgetAttributes;
    preview?: boolean;
    tags: string[];
    dashboards?: string;
}

export interface IWidgetDocument extends IWidget, mongoose.Document { }

export interface IWidgetModel extends mongoose.Model<IWidgetDocument>, ISearchableModel {
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
