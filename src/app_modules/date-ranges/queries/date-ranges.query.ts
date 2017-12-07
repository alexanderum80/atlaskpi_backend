import * as Promise from 'bluebird';
import { injectable } from 'inversify';

import { query, IQuery } from '../../../framework';
import { GetDateRangesActivity } from '../activities';
import { DateRangeResponse } from '../date-ranges.types';
import { DateRangeHelper, IDateRangeItem } from './date-range.helper';

@injectable()
@query({
    name: 'dateRanges',
    activity: GetDateRangesActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: DateRangeResponse, isArray: true }
})
export class DateRangesQuery implements IQuery<IDateRangeItem[]> {

    run(data: { filter: string }): Promise<IDateRangeItem[]> {
        const dateRanges = DateRangeHelper.GetDateRangeItems();
        return Promise.resolve(dateRanges);
    }
}
