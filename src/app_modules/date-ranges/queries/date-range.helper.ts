import {
    getDateRangeIdentifier,
    getDateRangeIdFromString,
    IChartDateRange,
    PredefinedComparisonDateRanges,
    PredefinedDateRanges,
} from '../../../domain/common/date-range';


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
               comparisonItems: DateRangeHelper.getComparisonItemsForDateRangeString(k)
           };

           return item;
        });

        return items;
    }

    public static getComparisonItemsForDateRangeString(dateRangeString: string): IDateRangeComparisonItem[] {
        if (!dateRangeString) { return []; }

        const comparisonElements = PredefinedComparisonDateRanges[getDateRangeIdentifier(dateRangeString)];

        if (!comparisonElements || comparisonElements.length === 0) { return []; }

        return Object.keys(comparisonElements).map(k => { return { key: k, value: comparisonElements[k] }; });
    }

    public static getComparisonItemsForDateRangeIdentifier(identifier: string): IDateRangeComparisonItem[] {
        if (!identifier) { return []; }

        const comparisonElements = PredefinedComparisonDateRanges[getDateRangeIdFromString(identifier)];

        if (!comparisonElements || comparisonElements.length === 0) { return []; }

        return Object.keys(comparisonElements).map(k => { return { key: k, value: comparisonElements[k] }; });
    }
}