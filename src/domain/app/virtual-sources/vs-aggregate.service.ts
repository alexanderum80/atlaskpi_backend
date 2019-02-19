
import { injectable, inject } from 'inversify';
import { AggregateStage } from '../../../app_modules/kpis/queries/aggregate';
import { IDateRange } from '../../common/date-range';
import { IVirtualSource, IVirtualSourceDocument, IFieldMetadata } from './virtual-source';
import { KPIFilterHelper } from '../kpis/kpi-filter.helper';
import { Logger } from './../../../domain/app/logger';
import { cloneDeep, isArray, isDate, isObject, isString, isNumber, isBoolean } from 'lodash';

export const ObjectReplacementPattern = new RegExp('^__[a-z]+[a-z]__$', 'i');

export enum AggPlaceholderTypeEnum {
    dateRange = 'DateRange',
    timezone = 'Timezone',
    dateNow = 'DateNow',
}

export interface IAggReplacementItem {
    id: string;
    type: AggPlaceholderTypeEnum;
}

const SUPPORTED_PLACEHOLDERS: IAggReplacementItem[] = [
    { id: '__from__', type: AggPlaceholderTypeEnum.dateRange },
    { id: '__to__', type: AggPlaceholderTypeEnum.dateRange },
    { id: '__timezone__', type: AggPlaceholderTypeEnum.timezone },
    { id: '__now__', type: AggPlaceholderTypeEnum.dateNow }
];

export interface IKeyValues {
    [key: string]: any;
}


const replacementString = [
    { key: '__dot__', value: '.' },
    { key: '__dollar__', value: '$' }
];


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

    processReplacements(virtualSource: IVirtualSource, replacements: IKeyValues): IProcessAggregateResult {
        let aggregate = [];
        let appliedReplacements = [];

        if (!virtualSource) throw new Error('virtual source cannot be empty');

        if (!virtualSource.aggregate) {
            return { aggregate, appliedReplacements };
        }

        if (virtualSource.aggregate && virtualSource.aggregate.length) {
           aggregate = virtualSource.aggregate.map(a => {
               return KPIFilterHelper.CleanObjectKeys(a);
           });
        }

        if (replacements) {
            appliedReplacements = this.walkAndReplace(aggregate, ObjectReplacementPattern, replacements);
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

        this.walkAndReplace(newAggregate, ObjectReplacementPattern, replacements);

        return newAggregate;
    }

    getFormulaFields(vs: IVirtualSource): { key: string, value: IFieldMetadata }[] {
        const fields = [];
        for (const [key, value] of Object.entries(vs.fieldsMap)) {
            if (!value.formula) continue;
            fields.push({ key, value });
        }

        return fields;
    }

    walkAndReplace(obj: any, pattern: RegExp, replacements: IKeyValues): IAggReplacementItem[] {
        const has = Object.prototype.hasOwnProperty.bind(obj);

        let appliedReplacements = [];

        for (const k in obj) if (has(k)) {
            switch (typeof obj[k]) {
                case 'object':
                    const applied =  this.walkAndReplace(obj[k], pattern, replacements);
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

    public cleanFilter(filter: any): any {
        let newFilter = {};

        if (!filter || isString(filter) ||
            isNumber(filter) || isBoolean(filter) ||
            isDate(filter)) {
            return filter;
        }

        Object.keys(filter).forEach(filterKey => {

            let key = filterKey;
            replacementString.forEach(r => key = key.replace(r.key, r.value));
            let value = filter[filterKey];

            if (!isArray(value) && !isDate(value) && isObject(value)) {
                newFilter[key] = this.cleanFilter(value);
            } else if (!isDate(value) && isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    value[i] = this.cleanFilter(value[i]);
                }
                newFilter[key] = value;
            } else {
                // apply filter
                let filterValue = filter[filterKey];
                const operatorName = filterKey.replace(/__dot__|__dollar__/g, '');

                if (this._isRegExpOperator(operatorName)) {
                    // process filter value
                    if (operatorName.indexOf('start') !== -1) {
                        filterValue = '^' + filterValue;
                    }

                    if (operatorName.indexOf('end') !== -1) {
                        filterValue = filterValue + '$';
                    }

                    key = '$regex';
                    if (operatorName === 'regex') {
                        value = new RegExp(filterValue);
                    } else {
                        value = new RegExp(filterValue, 'i');
                    }
                } else {
                    value = filterValue;
                }

                newFilter[key] = value;
            }
        });

        return newFilter;
    }


    public generateFormulaFieldStage(vs: IVirtualSource): any {
        const formulaFields = this.getFormulaFields(vs);

        if (!formulaFields || !formulaFields.length) return;

        const stage = { $addFields: { } };

        const __now__ = new Date(Date.now());

        const replacements: IKeyValues = {
            __now__
        };

        for (const field of formulaFields) {
            const cleanFormula = this.cleanFilter(field.value.formula);
            this.walkAndReplace(cleanFormula, ObjectReplacementPattern, replacements);
            stage.$addFields[field.value.path] = cleanFormula;
        }

        return stage;
    }

    private _isRegExpOperator(operator: string): boolean {
        const regexStrings = ['startWith', 'endWith', 'contains', 'regex'];

        return regexStrings.indexOf(operator) !== -1;
    }

}