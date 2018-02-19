import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as logger from 'winston';
import { uniqBy } from 'lodash';

export interface IObject {
    [key: string]: any;
}


export interface ICriteriaAggregate {
    $match?: IObject;
    $limit?: number;
    $group?: IObject;
}

export function criteriaPlugin(schema: mongoose.Schema): void {
    schema.statics.findCriteria = findCriteria;
}

function findCriteria(field: string, filter: string): Promise<string[]> {
    const that = this;
    const aggregateOptions = criteriaAggregation({ field, filter });

    return new Promise<string[]>((resolve, reject) => {
        that.aggregate(aggregateOptions).then(res => {
            const results = mapResults(res);

            resolve(results);
            return;
        }).catch(err => {
            reject(err);
            return;
        });
    });
}

function criteriaAggregation(input: {field: string, filter: string}): ICriteriaAggregate[] {
    let aggregate: ICriteriaAggregate[] = [
        { '$match': { [input.field]: { '$nin': ['', null] } } },
        { '$group': {
            _id: {
                'field': `$${input.field}`
            }
        }},
        { '$limit': 100 }
    ];

    if (!input.filter) {
        return aggregate;
    }

    // remove $limit from aggregate array when you have filter value
    aggregate = aggregate.filter(agg => !agg['$limit']);

    // get the $match object
    let matchStage: ICriteriaAggregate = findStage(aggregate, '$match');

    // return the original aggregate if cannot find match object
    if (!matchStage) {
        logger.error('match is undefined');

        // add limit if it was removed when have filter value
        const limit = findStage(aggregate, '$limit');
        if (!limit) {
            aggregate = aggregate.concat({ '$limit': 100 });
        }
        return aggregate;
    }

    // contain regular expression that is case insensitive
    const reg: RegExp = new RegExp(input.filter, 'i');
    // i.e. match: { [field]: { $regex: reg } }

    if (!matchStage.$match) {
        matchStage.$match = {};
    }

    Object.assign(matchStage.$match[input.field], {
        $regex: reg
    });

    return aggregate;
}

function findStage(aggregate: ICriteriaAggregate[], field: string): ICriteriaAggregate {
    // i.e. return value => undefined, or { [key]: value }
    return aggregate.find(a => a[field] !== undefined);
}

function mapResults(res: any[]): string[] {
    if (!res || !res.length) { return []; }
    return res.map(r => r._id.field);
}