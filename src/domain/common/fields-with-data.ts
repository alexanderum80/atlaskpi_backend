import { DataSourceField } from '../../app_modules/data-sources/data-sources.types';
import { IValueName } from './value-name';
import { Container } from 'inversify';
import { isObject, isEmpty, isNull, pick, isNumber, sortBy } from 'lodash';
import {IObject} from '../../app_modules/shared/criteria.plugin';
import * as Bluebird from 'bluebird';
import { dotCase, camelCase } from 'change-case';

export const blackListDataSource = ['GoogleAnalytics'];

interface ICollectionAggregation {
    $match?: IObject;
    $project?: IObject;
    $limit?: number;
}

export async function getFieldsWithData(model, fields: (DataSourceField|IValueName)[], collectionSource?: string[], aggregate?: any[]): Promise <string[]> {
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
                                async(field) => await getData(field, model, notIn, aggregate, collectionSource)
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

async function getData(field: DataSourceField|IValueName, model: any, notIn: IObject, aggregate: IObject[], collectionSource: string[]): Promise<any> {
    const fieldPath: string = (field as DataSourceField).path || (field as IValueName).value;
    const fieldName: string = field.name;

    const matchOptions = {
        '$match': {
            [fieldPath]: notIn
        }
    };

    const projectOptions = getProjectOptions(fieldName, fieldPath, aggregate);

    if (!isEmpty(collectionSource)) {
        Object.assign(matchOptions.$match, {
            source: {
                '$in': collectionSource
            }
        });
    }

    let modelAggregate: ICollectionAggregation[] = [
        matchOptions,
        projectOptions, {
            '$limit': 1
    }];

    const unwindStage = findStage(aggregate, '$unwind');
    if (!isEmpty(unwindStage)) {
        if (sortByProject(modelAggregate, aggregate)) {
            modelAggregate = sortBy(modelAggregate, '$project');
        }
        modelAggregate.unshift(unwindStage);
    }

    return await getAggregateResult(model, modelAggregate);
}

function getAggregateResult(model: any, aggObject: IObject[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        model.aggregate(aggObject).exec((err, data) => {
            resolve(data);
        }, (e) => {
            reject(e);
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


export function findStage(aggregate: any[], field: string) {
    if (!Array.isArray(aggregate)) {
        return;
    }
    return aggregate.find(agg => agg[field] !== undefined);
}