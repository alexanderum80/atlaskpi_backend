import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { isEmpty } from 'lodash';


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

function findCriteria(field: string, aggregate: any[], limit?: number, filter?: string): Promise<string[]> {
    const that = this;
    let aggregateOptions = aggregate.concat(criteriaAggregation({ field, limit, filter }));

    return new Promise<string[]>((resolve, reject) => {
        const agg = that.aggregate(aggregateOptions);
        agg.options = { allowDiskUse: true };
        
        agg.then(res => {
            const results = mapResults(res);

            resolve(results);
            return;
        }).catch(err => {
            reject(err);
            return;
        });
    });
}

function criteriaAggregation(input: {field: string, limit?: number, filter?: string}): ICriteriaAggregate[] {
    const unwindField = input.field.split('.')[0];

    let aggregate: ICriteriaAggregate[] = [{
        '$unwind': `$${unwindField}`
    }, {
        '$match': { [input.field]: { '$nin': ['', null, 'null', 'undefined'] } }
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

    // get the $match object
    let matchStage: ICriteriaAggregate = findStage(aggregate, '$match');

    if (!matchStage.$match) {
        matchStage.$match = {};
    }

    if (!isEmpty(input.filter)) {
        // contain regular expression that is case insensitive
        const reg: RegExp = new RegExp(input.filter, 'i');
        // i.e. match: { [field]: { $regex: reg } }
        Object.assign(matchStage.$match[input.field], {
            $regex: reg
        });
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