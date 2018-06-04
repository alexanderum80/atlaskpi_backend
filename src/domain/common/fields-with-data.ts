import { isObject } from 'lodash';
import {DataSourceField} from '../../app_modules/data-sources/data-sources.types';
import {IValueName} from './value-name';
import { Container } from 'inversify';
import { isEmpty, isNull } from 'lodash';
import {IObject} from '../../app_modules/shared/criteria.plugin';
import {Aggregate} from 'mongoose';
import * as Bluebird from 'bluebird';

export const blackListDataSource = ['GoogleAnalytics'];

interface IAggregateMatchQuery {
    $or: any[];
}

interface IAggregateProjectQuery extends IObject {
    _id: number;
}

interface IAggregateQuery {
    $match?: any;
    $project?: IAggregateProjectQuery;
    $limit?: number;
}

export async function getFieldsWithData(container: Container, dataSource: string, fields: (DataSourceField|IValueName)[], collectionSource?: string[]): Promise <string[]> {
    try {
        if (!container || !dataSource || isEmpty(fields)) {
            return [];
        }

        const model = (container.get(dataSource) as any).model;
        let fieldsWithData: string[] = [];
        const collectionQuery = [];
        let notIn = { '$nin': ['', null, 'null', 'undefined'] };

        if (!model) {
            return [];
        }

        fields.forEach(field => {
            const fieldPath: string = (field as DataSourceField).path || (field as IValueName).value;
            const fieldName: string = field.name;

            collectionQuery.push(
                model.aggregate([{
                    '$match': {
                        [fieldPath]: notIn
                    }
                }, {
                    '$project': {
                        [fieldName]: fieldPath
                    }
                }, {
                    '$limit': 1
                }])
            );
        });

        fieldsWithData = await Bluebird.all(collectionQuery);
        if (fieldsWithData) {
            const formatToObject = transformToObject(fieldsWithData);
            fieldsWithData = Object.keys(formatToObject);
        }

        return fieldsWithData;
    } catch (err) {
        throw new Error('error geting fields with data');
    }
}

function aggregateResponse(aggregate): Promise<Aggregate<Object[]>> {
    return new Promise<any>((resolve, reject) => {
        if (!aggregate || !aggregate.exec) {
            resolve([]);
            return;
        }
        aggregate.exec((err, data) => {
            resolve(data);
            return;
        }, (e) => {
            reject(e);
        });
    });
}


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

function findStage(aggregate: IAggregateQuery[], field: string): IAggregateQuery {
    return aggregate.find(agg => agg[field] !== undefined);
}