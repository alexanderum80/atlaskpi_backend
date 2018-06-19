import { DataSourceField } from '../../app_modules/data-sources/data-sources.types';
import { IValueName } from './value-name';
import { Container } from 'inversify';
import { isObject, isEmpty, isNull, pick, isNumber, sortBy } from 'lodash';
import {IObject} from '../../app_modules/shared/criteria.plugin';
import * as Bluebird from 'bluebird';
import { dotCase, camelCase } from 'change-case';
import {IDateRange} from './date-range';

export const blackListDataSource = ['GoogleAnalytics'];

interface ICollectionAggregation {
    $match?: IObject;
    $project?: IObject;
    $limit?: number;
    $sort?: IObject;
}


export interface IFieldsWithDataDatePipeline {
    timestampField?: string;
    dateRange?: IDateRange[];
}

export async function getFieldsWithData(
    model: any, fields: (DataSourceField|IValueName)[], collectionSource?: string[],
    aggregate?: any[], dateRangePipeline?: IFieldsWithDataDatePipeline, filter?: any): Promise <string[]> {
    try {
        if (!model || isEmpty(fields)) {
            return [];
        }

        let fieldsWithData: string[] = [];
        let notIn = { '$nin': ['', null, 'null', 'undefined'] };

        if (!model) {
            return [];
        }

        fieldsWithData = await Bluebird.map(fields,
                                async(field) => await getData(field, model, notIn, aggregate, collectionSource, dateRangePipeline, filter)
                                );
        if (fieldsWithData) {
            const formatToObject = transformToObject(fieldsWithData);
            fieldsWithData = Object.keys(formatToObject);
        }

        return fieldsWithData;
    } catch (err) {
        throw new Error('error geting fields with data');
    }
}

async function getData(field: DataSourceField|IValueName, model: any, notIn: IObject, aggregate: IObject[], collectionSource: string[], dateRangePipeline?: IFieldsWithDataDatePipeline, filter?: any): Promise<any> {
    const fieldPath: string = (field as DataSourceField).path || (field as IValueName).value;
    const fieldName: string = field.name;
    let addDateRange = false;

    const matchOptions = {
        '$match': {
            [fieldPath]: notIn
        }
    };

    const limitOptions = {
        '$limit': 1
    };

    // check if dateRangePipeline exists
    if (!isEmpty(dateRangePipeline)) {
        let dateRange;

        if (dateRangePipeline.timestampField && Array.isArray(dateRangePipeline.dateRange)) {
            dateRange = dateRangePipeline.dateRange[0];

            if (dateRange.$gte && dateRange.$lt) {
                addDateRange = true;
            }
        }

        if (addDateRange) {
            const timestampField = dateRangePipeline.timestampField;
            Object.assign(matchOptions.$match, {
                [timestampField]: dateRange
            });
        }
    }

    const projectOptions = getProjectOptions(fieldName, fieldPath, aggregate);

    // assign sortOptions if dateRangePipeline timestampfield and dateRange exists
    let sortOptions = {};
    if (addDateRange && dateRangePipeline.timestampField) {
        const projectTimeStampField = dateRangePipeline.timestampField;

        Object.assign(projectOptions.$project, {
            [projectTimeStampField]: 1
        });

        sortOptions = { '$sort': { [projectTimeStampField]: -1 } };
    }

    if (!isEmpty(collectionSource)) {
        Object.assign(matchOptions.$match, {
            source: {
                '$in': collectionSource
            }
        });
    }

    if (!isEmpty(filter)) {
        Object.assign(matchOptions.$match, filter);
    }

    let modelAggregate: ICollectionAggregation[] = [
        matchOptions,
        projectOptions
    ];

    // push sortOptions before limitOptions if sortOptions is not empty
    if (!isEmpty(sortOptions)) {
        modelAggregate.push(sortOptions, limitOptions);
    } else {
        modelAggregate.push(limitOptions);
    }

    if (sortByProject(modelAggregate, aggregate)) {
        modelAggregate = sortBy(modelAggregate, '$project');
    } else {
        const addFieldStage = findStage(aggregate, '$addFields');
        if (sortByAddFields(aggregate, fieldPath) && addFieldStage) {
            modelAggregate = modelAggregate.filter(m => !m['$project']);
            modelAggregate.unshift(addFieldStage);
        }
    }

    const unwindStage = findStage(aggregate, '$unwind');
    if (!isEmpty(unwindStage)) {
        modelAggregate.unshift(unwindStage);
    }

    return await getAggregateResult(model, modelAggregate);
}

function getAggregateResult(model: any, aggObject: IObject[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        model.aggregate(aggObject).exec((err, data) => {
            resolve(data);
            return;
        }, (e) => {
            reject(e);
            return;
        });
    });
}

export function sortByProject(modelAggregate: any[], aggregate: any[]): boolean {
    const matchStage = findStage(modelAggregate, '$match');
    const projectStage = findStage(aggregate, '$project');

    if (!hasMatchStage(matchStage) || !hasProjectStage(projectStage)) {
        return false;
    }

    const modelKey: string = Object.keys(matchStage.$match)[0];
    const projectKeys: any[] = Object.keys(projectStage.$project);

    const found: number = projectKeys.findIndex(k => k === modelKey);

    if (found !== -1) {
        return true;
    }
    return false;
}

export function sortByAddFields(aggregate: any[], fieldPath: string): boolean {
    const addFieldStage = findStage(aggregate, '$addFields');

    if (!hasAddFieldStage(addFieldStage)) {
        return false;
    }

    const addFieldKeys: string[] = Object.keys(addFieldStage.$addFields);
    return addFieldKeys.indexOf(fieldPath) !== -1;
}

export function getProjectOptions(fieldName: string, fieldPath: string, aggregate: any[], projectNumber?: boolean): IObject {
    const fieldPathValue = projectNumber ? 1 : `$${fieldPath}`;
    const defaultProjectOptions = {
        '$project': {
            [fieldName]: fieldPathValue
        }
    };

    if (!isEmpty(aggregate)) {
        const projectStage = findStage(aggregate, '$project');

        if (projectStage && projectStage.$project) {
            const stage = pick(projectStage.$project, fieldPath);
            let isNumeric = false;

            Object.keys(stage).forEach(k => {
                if (isNumber(stage[k])) {
                    isNumeric = true;
                }
            });

            if (!isEmpty(stage) && !isNumeric) {
                return { '$project': stage };
            }
        }

        return defaultProjectOptions;
    }
    return defaultProjectOptions;
}

// i.e [ [], [{ [key: string]: any}] ]
export function transformToObject(arr: any[]): any {
    if (!arr) { return; }
    const newObject = {};

    arr.forEach((item) => {
        if (item && Array.isArray(item)) {
            item.forEach(obj => {
                if (isObject(obj)) {
                    Object.assign(newObject, obj);
                }
            });
        }
    });
    return newObject;
}


function hasMatchStage(matchStage): boolean {
    return matchStage && matchStage.$match;
}

function hasProjectStage(projectStage): boolean {
    return projectStage && projectStage.$project;
}

function hasAddFieldStage(addFieldStage): boolean {
    return addFieldStage && addFieldStage.$addFields;
}


export function findStage(aggregate: any[], field: string) {
    if (!Array.isArray(aggregate)) {
        return;
    }
    return aggregate.find(agg => agg[field] !== undefined);
}