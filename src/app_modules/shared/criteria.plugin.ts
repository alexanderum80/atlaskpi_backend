import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';


export interface IObject {
    [key: string]: any;
}


export interface ICriteriaAggregate {
    $unwind?: string;
    $match?: IObject;
    $limit?: number;
    $group?: IObject;
}

export function criteriaPlugin(schema: mongoose.Schema): void {
    schema.statics.findCriteria = findCriteria;
}

function findCriteria(field: string, aggregate: any[], limit?: number, filter?: string, collectionSource?: string): Promise<string[]> {
    const that = this;
    let aggregateOptions = aggregate.concat(criteriaAggregation({ field, limit, filter, collectionSource }));

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

function criteriaAggregation(input: {field: string, limit?: number, filter?: string, collectionSource?: string}): ICriteriaAggregate[] {
    const unwindField = input.field.split('.')[0];

    let aggregate: ICriteriaAggregate[] = [{
        '$unwind': `$${unwindField}`
    }, {
        '$match': { [input.field]: { '$nin': ['', null] } }
    }, {
        '$group': {
            _id: {
                'field': `$${input.field}`
            }
        }
    }];

    aggregate = aggregate.concat({
        $limit: input.limit
    });


    if (!input.filter) {
        return aggregate;
    }

    // get the $match object
    let matchStage: ICriteriaAggregate = findStage(aggregate, '$match');

    // contain regular expression that is case insensitive
    const reg: RegExp = new RegExp(input.filter, 'i');
    // i.e. match: { [field]: { $regex: reg } }

    if (!matchStage.$match) {
        matchStage.$match = {};
    }

    Object.assign(matchStage.$match[input.field], {
        $regex: reg
    });

    if (input.collectionSource) {
        matchStage.$match['source'] = input.collectionSource;
    }

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