import { DataSourceField } from '../../app_modules/data-sources/data-sources.types';
import { IValueName } from './value-name';
import { Container } from 'inversify';
import { isObject, isEmpty, isNull } from 'lodash';
import {IObject} from '../../app_modules/shared/criteria.plugin';
import * as Bluebird from 'bluebird';

export const blackListDataSource = ['GoogleAnalytics'];

interface ICollectionAggregation {
    $match?: IObject;
    $project?: IObject;
    $limit?: number;
}

export async function getFieldsWithData(model, fields: (DataSourceField|IValueName)[], collectionSource?: string[]): Promise <string[]> {
    try {
        if (!model || isEmpty(fields)) {
            return [];
        }

        let fieldsWithData: string[] = [];

        const collectionAggregations = [];
        let notIn = { '$nin': ['', null, 'null', 'undefined'] };

        if (!model) {
            return [];
        }

        fields.forEach(field => {
            const fieldPath: string = (field as DataSourceField).path || (field as IValueName).value;
            const fieldName: string = field.name;


            const matchOptions = {
                '$match': {
                    [fieldPath]: notIn
                }
            };
            if (!isEmpty(collectionSource)) {
                Object.assign(matchOptions.$match, {
                    source: {
                        '$in': collectionSource
                    }
                });
            }
            const modelAggregate: ICollectionAggregation[] = [
                matchOptions
                , {
                    '$project': {
                        [fieldName]: `$${fieldPath}`
                    }
                }, {
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
