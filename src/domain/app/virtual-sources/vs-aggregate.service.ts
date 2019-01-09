
import { injectable, inject } from 'inversify';
import { AggregateStage } from '../../../app_modules/kpis/queries/aggregate';
import { IDateRange } from '../../common/date-range';
import { cloneDeep } from 'lodash';
import { IVirtualSource, IVirtualSourceDocument } from './virtual-source';
import { KPIFilterHelper } from '../kpis/kpi-filter.helper';
import { Logger } from './../../../domain/app/logger';

const pattern = new RegExp('^__[a-z]+[a-z]__$', 'i');

export enum AggPlaceholderTypeEnum {
    dateRange = 'DateRange',
    timezone = 'Timezone'
}

export interface IAggReplacementItem {
    id: string;
    type: AggPlaceholderTypeEnum;
}

const SUPPORTED_PLACEHOLDERS: IAggReplacementItem[] = [
    { id: '__from__', type: AggPlaceholderTypeEnum.dateRange },
    { id: '__to__', type: AggPlaceholderTypeEnum.dateRange },
    { id: '__timezone__', type: AggPlaceholderTypeEnum.timezone }
];

export interface IKeyValues {
    [key: string]: any;
}

export interface IProcessAggregateResult {
    aggregate: AggregateStage[];
    appliedReplacements: IAggReplacementItem[];
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

    processReplacements(virtualSource: IVirtualSourceDocument, replacements: IKeyValues): IProcessAggregateResult {
        let aggregate = [];
        let appliedReplacements = [];

        if (!virtualSource) throw new Error('virtual source cannot be empty');

        if (!virtualSource.aggregate) {
            return { aggregate, appliedReplacements };
        }

        const objVirtualSource = virtualSource.toObject();

        if (objVirtualSource.aggregate && objVirtualSource.aggregate.length) {
           aggregate = objVirtualSource.aggregate.map(a => {
               return KPIFilterHelper.CleanObjectKeys(a);
           });
        }

        if (replacements) {
            appliedReplacements = this._walkAndReplace(aggregate, pattern, replacements);
        }

        return { appliedReplacements, aggregate };
    }

    tryDateRangeAsFirstStage(
        aggregate: AggregateStage[],
        virtualSource: IVirtualSourceDocument,
        parentVirtualSource: IVirtualSourceDocument,
        dateRange: IDateRange): IProcessAggregateResult {

        let appliedReplacements = [];
        let topDateRangeStage;

        if (!virtualSource) throw new Error('virtual source cannot be empty');

        if (!virtualSource.aggregate) {
            return { aggregate, appliedReplacements };
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

            appliedReplacements = [
                SUPPORTED_PLACEHOLDERS.find(p => p.id === '__from__'),
                SUPPORTED_PLACEHOLDERS.find(p => p.id === '__to__'),
            ];
        }

        if (topDateRangeStage) {
            aggregate.unshift(topDateRangeStage);
        }

        return { appliedReplacements, aggregate };
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

    private _walkAndReplace(obj: any, pattern: RegExp, replacements: IKeyValues): IAggReplacementItem[] {
        const has = Object.prototype.hasOwnProperty.bind(obj);

        let appliedReplacements = [];

        for (const k in obj) if (has(k)) {
            switch (typeof obj[k]) {
                case 'object':
                    const applied =  this._walkAndReplace(obj[k], pattern, replacements);
                    appliedReplacements = Array.from(new Set([].concat(...appliedReplacements, ...applied)));
                    break;

                case 'string':
                    if (pattern.test(obj[k])) {
                        const placeHolder = SUPPORTED_PLACEHOLDERS.find(p => p.id === obj[k]);

                        if (!placeHolder)  {
                            // I tried to throw an exception here but it was being swallow, then I decided to log it
                            this._logger.error('virtual source placeholder not supported');
                            break;
                        }

                        obj[k] = replacements[obj[k]];
                        appliedReplacements.push(placeHolder);
                    }
                    break;
            }
        }

        return appliedReplacements;
    }

}