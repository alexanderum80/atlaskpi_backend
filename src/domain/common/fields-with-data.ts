import { DataSourceField } from '../../app_modules/data-sources/data-sources.types';
import { IValueName } from './value-name';
import { Container } from 'inversify';
import { isObject, isEmpty, isNull, pick } from 'lodash';
import {IObject} from '../../app_modules/shared/criteria.plugin';
import * as Bluebird from 'bluebird';
import { dotCase } from 'change-case';

export const blackListDataSource = ['GoogleAnalytics'];

interface ICollectionAggregation {
    $match?: IObject;
    $project?: IObject;
    $limit?: number;
}

export async function getFieldsWithData(
    container: Container, dataSource: string, fields: (DataSourceField|IValueName)[],
    collectionSource?: string[], aggregate?: any[]): Promise <string[]> {
    try {
        if (!container || !dataSource || isEmpty(fields)) {
            return [];
        }

        const model = (container.get(dataSource) as any).model;
        let fieldsWithData: string[] = [];

        const collectionAggregations = [];
        let notIn = { '$nin': ['', null, 'null', 'undefined'] };

        if (!model) {
            return [];
        }

        fields.forEach(field => {
            const fieldPath: string = getFieldPath(field, aggregate);
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

            collectionAggregations.push(
                model.aggregate(modelAggregate)
            );
        });

        fieldsWithData = await Bluebird.all(collectionAggregations);
        if (fieldsWithData) {
            const formatToObject = transformToObject(fieldsWithData);
            fieldsWithData = Object.keys(formatToObject);
        }

        return fieldsWithData;
    } catch (err) {
        throw new Error('error geting fields with data');
    }
}

// {
//     '$project': {
//         [fieldName]: fieldPath
//     }
// }

function getProjectOptions(fieldName: string, fieldPath: string, aggregate: any[]): IObject {
    if (!isEmpty) {
        const projectStage = findStage(aggregate, '$project');
        return pick(projectStage, fieldPath);
    }
    return {
        '$project': {
            [fieldName]: `$${fieldPath}`
        }
    };
}

function getFieldPath(field, aggregate: any[]): string {
    const fieldPath = (field as DataSourceField).path || (field as IValueName).value;
    if (!isEmpty(aggregate)) {
        return dotCase(fieldPath);
    }
    return fieldPath;
}

// i.e [ [], [{ [key: string]: any}] ]
export function transformToObject(arr: any[]): any {
    if (!arr) { return; }
    const newObject = {};

    arr.forEach((singleArray) => {
        if (singleArray && Array.isArray(singleArray)) {
            singleArray.forEach(obj => {
                if (isObject(obj)) {
                    Object.assign(newObject, obj);
                }
            });
        }
    });
    return newObject;
}


function findStage(aggregate: any[], field: string) {
    return aggregate.find(agg => agg[field] !== undefined);
}