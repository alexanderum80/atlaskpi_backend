import * as Promise from 'bluebird';
import { injectable } from 'inversify';

import { query, QueryBase } from '../../../framework';
import { GetDateRangesActivity } from '../activities';
import { DateRangeResponse } from '../date-ranges.types';
import { DateRangeHelper } from './date-range.helper';

@injectable()
@query({
    name: 'dateRanges',
    activity: GetDateRangesActivity,
    parameters: [
        { name: 'filter', type: String },
    ],
    output: { type: DateRangeResponse, isArray: true }
})
export class DateRangesQuery extends QueryBase<DateRangeResponse[]> {
    constructor() {
        super();
    }

    run(data: { filter: string }): Promise<DateRangeResponse[]> {
        const dateRanges = DateRangeHelper.GetDateRangeItems();
        return Promise.resolve(dateRanges);
    }
}
