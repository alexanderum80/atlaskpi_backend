import { isObject } from 'lodash';
import {DataSourceField} from '../../app_modules/data-sources/data-sources.types';
import {IValueName} from './value-name';
import { Container } from 'inversify';
import { isEmpty } from 'lodash';
import {IObject} from '../../app_modules/shared/criteria.plugin';

export const blackListDataSource = ['GoogleAnalytics'];

interface IAggregateMatchQuery {
    $or: any[];
}

interface IAggregateProjectQuery extends IObject {
    _id: number;
}

interface IAggregateQuery {
    $match?: IAggregateMatchQuery;
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
        const aggregateQuery: IAggregateQuery[] = [
            {
                '$match': { $or: [] }
            }, {
                '$project': { _id: 0 }
            }, {
                '$limit': 1
        }];
        let notIn = { '$nin': ['', null, 'null', 'undefined'] };

        if (!model) {
            return [];
        }

        let matchStage = findStage(aggregateQuery, '$match');

        if (collectionSource) {
            Object.assign(matchStage.$match, {
                source: {
                    '$in': collectionSource
                }
            });
        }

        fields.forEach((field: DataSourceField|IValueName) => {
            // i.e referrable.name
            const fieldPath: string = (field as DataSourceField).path || (field as IValueName).value;
            // Referral
            const fieldName: string = field.name;

            matchStage.$match.$or.push({
                [fieldPath]: notIn
            });

            let projectStage = findStage(aggregateQuery, '$project');
            Object.assign(projectStage.$project, {
                [fieldName]: fieldPath
            });

        });

        const fieldsExists: any[] = await model.aggregate(aggregateQuery).exec();
        if (fieldsExists) {
            const formatToObject = transformToObject(fieldsExists);
            fieldsWithData = Object.keys(formatToObject);

            return fieldsWithData;
        }

        return fieldsWithData;
    } catch (err) {
        throw new Error('error geting fields with data');
    }
}


export function transformToObject(arr: any[]): any {
    if (!arr) { return; }
    const newObject = {};

    arr.forEach(item => {
        if (item && Array.isArray(item)) {
            item.forEach(obj => {
                if (isObject(obj)) {
                    Object.assign(newObject, obj);
                }
            });
        } else {
            if (isObject(item)) {
                Object.assign(newObject, item);
            }
        }
    });

    return newObject;
}

function findStage(aggregate: IAggregateQuery[], field: string): IAggregateQuery {
    return aggregate.find(agg => agg[field] !== undefined);
}