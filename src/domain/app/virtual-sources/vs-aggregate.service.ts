
import { injectable, inject } from 'inversify';
import { AggregateStage } from '../../../app_modules/kpis/queries/aggregate';
import { IDateRange } from '../../common/date-range';
import { cloneDeep } from 'lodash';
import { VirtualSources } from './virtual-source.model';
import { IVirtualSource, IVirtualSourceDocument } from './virtual-source';
import { KPIFilterHelper } from '../kpis/kpi-filter.helper';

const pattern = new RegExp('^__[a-z]+[a-z]__$', 'i');

const SUPPORTED_PLACEHOLDERS = [
    '__from__',
    '__to__'
];

function walkAndReplace(obj: any, pattern: RegExp, replacements: IKeyValues) {
    const has = Object.prototype.hasOwnProperty.bind(obj);

    for (const k in obj) if (has(k)) {
        switch (typeof obj[k]) {
            case 'object':
                walkAndReplace(obj[k], pattern, replacements);
                break;
            case 'string':
                if (pattern.test(obj[k])) {
                    if (!SUPPORTED_PLACEHOLDERS.includes(obj[k]))  {
                        console.log('virtual source placeholder not supported');
                        return;
                    }
                    obj[k] = replacements[obj[k]];
                }
        }
    }
}

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

    processReplacements(virtualSource: IVirtualSourceDocument, replacements: IKeyValues): IProcessAggregateResult {
        let aggregate = [];
        let dateRangeApplied = false;

        if (!virtualSource) throw new Error('virtual source cannot be empty');

        if (!virtualSource.aggregate) {
            return { aggregate, dateRangeApplied };
        }

        const objVirtualSource = virtualSource.toObject();

        if (objVirtualSource.aggregate && objVirtualSource.aggregate.length) {
           aggregate = objVirtualSource.aggregate.map(a => {
               return KPIFilterHelper.CleanObjectKeys(a);
           });
        }

        if (replacements) {
            const originalAggregate = cloneDeep(aggregate);
            walkAndReplace(aggregate, pattern, replacements);

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

        if (!virtualSource) throw new Error('virtual source cannot be empty');

        if (!virtualSource.aggregate) {
            return { aggregate, dateRangeApplied };
        }

        let topDateRangeStage;

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
                '__from__': new Date(-8640000000000000),
                '__to__': new Date(8640000000000000)
            };
        }

        const newAggregate = cloneDeep(aggregate);

        walkAndReplace(newAggregate, pattern, replacements);

        console.log('walk ended');
        return newAggregate;
    }

}