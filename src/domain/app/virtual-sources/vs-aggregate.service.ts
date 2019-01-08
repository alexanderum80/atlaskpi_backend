
import { injectable, inject } from 'inversify';
import { AggregateStage } from '../../../app_modules/kpis/queries/aggregate';
import { IDateRange } from '../../common/date-range';
import { cloneDeep } from 'lodash';
import { IVirtualSource, IVirtualSourceDocument } from './virtual-source';
import { KPIFilterHelper } from '../kpis/kpi-filter.helper';
import { Logger } from './../../../domain/app/logger';

const pattern = new RegExp('^__[a-z]+[a-z]__$', 'i');

const SUPPORTED_PLACEHOLDERS = [
    '__from__',
    '__to__'
];


export interface IKeyValues {
    [key: string]: any;
}

export interface IProcessAggregateResult {
    aggregate: AggregateStage[];
    dateRangeApplied: boolean;
}

export interface IProcessAggregateOptions {
    virtualSource: IVirtualSourceDocument;
    replacements: IKeyValues;
    parentVirtualSource?: IVirtualSource | IVirtualSourceDocument;
    dateRange?: IDateRange;
}

@injectable()
export class VirtualSourceAggregateService {

    constructor(
        @inject(Logger.name) private _logger: Logger
    ) { }

    processReplacements(virtualSource: IVirtualSource, replacements: IKeyValues): IProcessAggregateResult {
        let aggregate = [];
        let dateRangeApplied = false;

        if (!virtualSource) throw new Error('virtual source cannot be empty');

        if (!virtualSource.aggregate) {
            return { aggregate, dateRangeApplied };
        }

        if (virtualSource.aggregate && virtualSource.aggregate.length) {
           aggregate = virtualSource.aggregate.map(a => {
               return KPIFilterHelper.CleanObjectKeys(a);
           });
        }

        if (replacements) {
            const originalAggregate = cloneDeep(aggregate);
            this._walkAndReplace(aggregate, pattern, replacements);

            if (JSON.stringify(originalAggregate) !== JSON.stringify(aggregate)) {
                dateRangeApplied = true;
            }
        }

        return { dateRangeApplied, aggregate };
    }

    tryDateRangeAsFirstStage(
        aggregate: AggregateStage[],
        virtualSource: IVirtualSourceDocument,
        parentVirtualSource: IVirtualSourceDocument,
        dateRange: IDateRange): IProcessAggregateResult {

        let dateRangeApplied = false;
        let topDateRangeStage;

        if (!virtualSource) throw new Error('virtual source cannot be empty');

        if (!virtualSource.aggregate) {
            return { aggregate, dateRangeApplied };
        }

        if (parentVirtualSource && parentVirtualSource.name
            && Object.values(parentVirtualSource.fieldsMap)
                     .some(f => f.path === virtualSource.dateField)
            && dateRange) {
            topDateRangeStage = {
                '$match': {
                    [virtualSource.dateField]: {
                        '$gte':  dateRange.from,
                        '$lt':   dateRange.to
                    }
                }
            };
            dateRangeApplied = true;
        }

        if (topDateRangeStage) {
            aggregate.unshift(topDateRangeStage);
        }

        return { dateRangeApplied, aggregate };
    }

    applyDateRangeReplacement(
        aggregate: AggregateStage[],
        dateRange?: IDateRange): AggregateStage[] {
        let replacements = {};

        if (dateRange) {
            replacements = {
                '__from__': dateRange.from,
                '__to__': dateRange.to,
            };
        } else {
            replacements = {
                '__from__': new Date(-8640000000000000), // MinDate
                '__to__': new Date(8640000000000000) // MaxDate
            };
        }

        const newAggregate = cloneDeep(aggregate);

        this._walkAndReplace(newAggregate, pattern, replacements);

        return newAggregate;
    }


    private _walkAndReplace(obj: any, pattern: RegExp, replacements: IKeyValues) {
    const has = Object.prototype.hasOwnProperty.bind(obj);

    for (const k in obj) if (has(k)) {
        switch (typeof obj[k]) {
            case 'object':
                this._walkAndReplace(obj[k], pattern, replacements);
                break;
            case 'string':
                if (pattern.test(obj[k])) {
                    if (!SUPPORTED_PLACEHOLDERS.includes(obj[k]))  {
                        // I tried to throw an exception here but it was being swallow, then I decided to log it
                        this._logger.error('virtual source placeholder not supported');
                        return;
                    }
                    obj[k] = replacements[obj[k]];
                }
        }
    }
}

}