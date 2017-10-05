import { IDateRangeComparisonItem } from './date-range.helper';
import {
    getDateRangeIdentifier,
    IChartDateRange,
    PredefinedComparisonDateRanges,
    PredefinedDateRanges,
} from '../../../models/common/date-range';

export interface IDateRangeComparisonItem {
    key: string;
    value: string;
}

export interface IDateRangeItem {
    dateRange: IChartDateRange;
    comparisonItems: IDateRangeComparisonItem[];
}

export class DateRangeHelper {

    public static GetDateRangeItems(): IDateRangeItem[] {
        const items = Object.keys(PredefinedDateRanges).map(k => {
           const item: IDateRangeItem = {
               dateRange: { predefined: PredefinedDateRanges[k] },
               comparisonItems: DateRangeHelper._getComparisonItemsFor(k)
           };

           return item;
        });

        return items;
    }

    private static _getComparisonItemsFor(dateRangeString: string): IDateRangeComparisonItem[] {
        if (!dateRangeString) { return []; }

        const comparisonElements = PredefinedComparisonDateRanges[getDateRangeIdentifier(dateRangeString)];

        if (!comparisonElements || comparisonElements.length === 0) { return []; }

        return Object.keys(comparisonElements).map(k => { return { key: k, value: comparisonElements[k] }; });
    }
}