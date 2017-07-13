import { AggregateStage } from './aggregate';
import { IAppModels } from '../../../models/app/app-models';
import { IDateRange } from '../../../models/common/date-range';
import { FrequencyEnum } from '../../../models/common/frequency-enum';
import * as Promise from 'bluebird';

export interface IKPIGrouping {
    leve: number;
    name: string;
}

export interface IKPIMetadata {
    name?: string;
    code?: string;
    dateRange: IDateRange;
    frequency: FrequencyEnum;
    grouping?: IKPIGrouping[];
    drillDown?: boolean;
}

export interface IKPIResult {
    data: any[];
    metadata?: IKPIMetadata;
}

export interface IKpiBase {
    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any>;
    getRawData?(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any>;
}

export class KpiBase {
    frequency: FrequencyEnum;

    constructor(public model: any, public aggregate: AggregateStage[]) { }

    executeQuery(dateField: string, dateRange?: IDateRange, frequency?: FrequencyEnum): Promise<any> {

        if (!this.model) throw 'A model is required to execute kpi query';
        if (!dateField) throw 'A date field is required to execute kpi query';

        let that = this;

        return new Promise<any>((resolve, reject) => {
            if (dateRange)
                that._injectDataRange(dateRange, dateField);
            if (frequency !== undefined)
                that._injectFrequency(frequency, dateField);

            // decompose aggregate object into array
            let aggregateParameters = [];

            that.aggregate.forEach(stageOperator => {
                let operator = this._getAggregateOperator(stageOperator);
                aggregateParameters.push(operator);
            });

            this.model.aggregate(...aggregateParameters).then(data => {
                resolve(data);
            }, (e) => {
                reject(e);
            });
        });
    }

    findStage(booleanField: string, stageOperator: string): AggregateStage {
        return this.aggregate.find(s => s[booleanField] === true && s[stageOperator] !== undefined);
    }

    findStages(stageOperator: string): AggregateStage[] {
        return this.aggregate.filter(s => s[stageOperator] !== undefined);
    }

    private _getAggregateOperator(stage: AggregateStage) {
        let operator: any;
        let operators = [
            '$match', '$project', '$group', '$sort', '$redact', '$limit', '$skip', '$unwind', '$sample',
            '$geoNear', '$lookup', '$out', '$sortByCount', '$addFields', '$count'];

        Object.keys(stage).forEach(k => {
            if (operators.indexOf(k) !== -1) {
                operator = {};
                operator[k] = stage[k];
            }
        });

        return operator;
    }

    private _injectDataRange(dateRange: IDateRange, field: string) {
        // find date range sectiopn or first $match section instead
        let matchStage = this.findStage('dateRange', '$match');

        if (!matchStage) {
            throw 'KpiBase#_injectDataRange: Cannot inject date range because a dateRAnge/$match stage could not be found';
        }


        // apply date range
        if (dateRange) {
            matchStage.$match[field] = { '$gte': dateRange.from, '$lte': dateRange.to };
        }
    }

    private _injectFrequency(frequency: FrequencyEnum, field: string) {
        // console.log(typeof frequency);
        if (frequency === undefined) return;

        field = '$' + field;

        let groupStage = this.findStage('frequency', '$group');

        if (!groupStage) {
            this.aggregate.push({ $group: { _id: {} } });
            groupStage = this.findStage('frequency', '$group');
        }

        if (!groupStage.$group._id) {
            groupStage.$group._id = { };
        }

        let currentGrouping: any;
        let projectStage = this.findStage('frequency', '$project');

        if (!projectStage) throw 'An aggregate needs a project operator defined for a frequency';

        switch (frequency) {

            case FrequencyEnum.Daily:
                if (!projectStage.$project) projectStage.$project = { };

                // add to the projection the frequency field with year, month and day: YYYY-MM-DD
                projectStage.$project.frequency = {
                    $concat: [
                        { $substr: [ { $year: field }, 0, 4 ] },
                        '-',
                        { $cond: [
                            { $lte: [ { $month: field }, 9 ] },
                            { $concat: [
                                '0', { $substr: [ { $month: field }, 0, 2 ] }
                            ]},
                            { $substr: [ { $month: field }, 0, 2 ] }
                        ]},
                        '-',
                        { $cond: [
                            { $lte: [ { $dayOfMonth: field }, 9 ] },
                            { $concat: [
                                '0', { $substr: [ { $dayOfMonth: field }, 0, 2 ] }
                            ]},
                            { $substr: [ { $dayOfMonth: field }, 0, 2 ] }
                        ]}
                    ]
                };

                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: '$frequency' };
                break;

            case FrequencyEnum.Weekly:
                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: { $week: field } };
                break;
            case FrequencyEnum.Monthly:
                if (!projectStage.$project) projectStage.$project = { };

                // add to the projection the frequency field with year and month: YYYY-MM
                projectStage.$project.frequency = {
                    $concat: [
                        { $substr: [ { $year: field }, 0, 4 ] },
                        '-',
                        { $cond: [
                            { $lte: [ { $month: field }, 9 ] },
                            { $concat: [
                                '0', { $substr: [ { $month: field }, 0, 2 ] }
                            ]},
                            { $substr: [ { $month: field }, 0, 2 ] }
                        ]}
                    ]
                };

                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: '$frequency' };
                break;
            case FrequencyEnum.Quartely:
                // I need to add a projection if it does not exist
                if (!projectStage.$project) projectStage.$project = {};

                projectStage.$project.frequency = {
                    $concat: [
                        { $substr: [ { $year: field }, 0, 4 ] },
                        '-',
                        { $cond: [
                            { $lte: [{ $month: field }, 3] },
                                'Q1',
                                { $cond: [
                                    { $lte: [{ $month: field }, 6] },
                                        'Q2',
                                        { $cond: [
                                            { $lte: [{ $month: field }, 9] },
                                            'Q3',
                                            'Q4'
                                        ] }
                                ] }
                        ] }
                    ]
                };

                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: '$frequency' };
                break;
            case FrequencyEnum.Yearly:
                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: { $year: field } };
                break;
        }

        let that = this;

        // restore the rest of the grouping if there is anything to restore
        if (!currentGrouping) return;

        Object.keys(currentGrouping).forEach(prop => {
            groupStage.$group._id[prop] = currentGrouping[prop];
        });

    }

}