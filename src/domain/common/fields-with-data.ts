import { isObject } from 'lodash';
import {DataSourceField} from '../../app_modules/data-sources/data-sources.types';
import {IValueName} from './value-name';
import { Container } from 'inversify';
import { isEmpty } from 'lodash';
import * as Bluebird from 'bluebird';

export const blackListDataSource = ['GoogleAnalytics'];

export async function getFieldsWithData(container: Container, dataSource: string, fields: (DataSourceField|IValueName)[], collectionSource?: string[]): Promise <string[]> {
    if (!container || !dataSource || isEmpty(fields)) {
        return [];
    }

    const collectionQuery = [];
    const model = (container.get(dataSource) as any).model;
    let fieldsWithData: string[] = [];

    if (!model) {
        return [];
    }

    fields.forEach((field: DataSourceField|IValueName) => {
        // i.e referrable.name
        const fieldPath: string = (field as DataSourceField).path || (field as IValueName).value;
        // Referral
        const fieldName: string = field.name;

        let matchStage = {
            $match: {
                [fieldPath]: {
                    $nin: ['', null, 'null', 'undefined']
                }
            }
        };

        if (Array.isArray(collectionSource) && collectionSource.length) {
            Object.assign(
                matchStage.$match, {
                    source: {
                        $in: collectionSource
                    }
                }
            );
        }

        collectionQuery.push(
            model.aggregate([
                matchStage,
                {
                    $project: {
                        _id: 0,
                        // i.e. Referral: referral.name
                        [fieldName]: fieldPath
                    }
                }
            ])
        );
    });

    const fieldsExists: any[] = await Bluebird.all(collectionQuery);
    if (fieldsExists) {
        const formatToObject = transformToObject(fieldsExists);
        fieldsWithData = Object.keys(formatToObject);

        return fieldsWithData;
    }

    return fieldsWithData;
}

export function transformToObject(arr: any[]): any {
    if (!arr) { return; }
    const newObject = {};

    arr.forEach(singleArray => {
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