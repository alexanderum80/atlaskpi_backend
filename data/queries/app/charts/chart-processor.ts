import { IChartDocument } from '../../../models/app/charts';
import { IAppModels } from '../../../models/app/app-models';
import { IKPI } from '../../../models/app/kpis';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { MODEL_METADATA } from './model-metadata';
import * as _ from 'lodash';
let jsep = require('jsep');



// add custom parser
jsep.addUnaryOp('@');

export interface IChartData {
    xAxis: string[];
    series: any[];
}

// export interface IChart


const OPERATOR_MAP = {
    '&&': '$and',
    '>': '$gt',
    '<': '$lt',
    '>=': '$gte',
    '<=': '$lte',
    '==': '$eq',
    '||': '$or',
    '!=': '$ne'
};

const AGGREGATES_MAP = {
    Sum: '$sum',
    Avg: '$avg'
};

const VARIABLE_NAME = 'item';

export class ChartProcessor {

    private model: any;
    private modelName: string;
    private modelLower: string;
    private modelPath: string;
    private postProcessing: string;
    private aggregate = [];

    constructor(private _ctx: IAppModels) { }

    public getChartDefinition(data: { id: string, from: Date, to: Date }): Promise<any> {
        let that = this;

        return new Promise<string>((resolve, reject) => {
            // get chart
            this._ctx.Chart.findById(data.id)
            .populate('kpis')
            .exec(function(err, chart) {
                if (err) {
                    reject(err);
                    return;
                }

                if (!chart) {
                    reject({ message: 'Chart not found' });
                    return;
                }

                that._getData(chart, data.from, data.to).then(function(graphData: IChartData) {
                    chart.chartDefinition.xAxis = graphData.xAxis;
                    chart.chartDefinition.series = graphData.series;
                    resolve(chart.chartDefinition);
                });
            });
        });
    }

    private _getData(chart: IChartDocument, from, to): Promise<IChartData> {
        let that = this;

        let kpi: IKPI = chart.kpis[0];
        let aggregate = that._resolveAggregate(chart, from, to);

        // update chart data
        chart.chartDefinition.title.text = kpi.name;
        chart.chartDefinition.subtitle.text = '';

        return new Promise<any>((resolve, reject) => {
            this.model.aggregate(aggregate).then((result) => {
                if (that.postProcessing === 'average') {
                    let count = result.length;
                    result.forEach((item) => {
                        item[that.modelLower] = item[that.modelLower] / count;
                    });
                }
                let series = that._processSeries(kpi, chart.frequency, result);
                resolve(series);
            }, (err) => {
                reject(err);
            });
        });
    }

    private _processSeries(kpi: IKPI, frequency: string, result) {

        let categories: string[] = <string[]>_.uniq(result.map(item => item['_id'][kpi.axisSelection]));

        if (!frequency) {
            return {
                series: [ {
                    name: this.modelName,
                    data: result.map(item => item[this.modelLower])
                } ],
                xAxis: { 'categories': categories }
            };
        }

        // let categories = _.sortBy(_.uniq(result.map(item => item['_id'][kpi.axisSelection])));

        // process frequency
        let series: any;
        let xAxis: any;
        let groupKeys: any;

        switch (frequency) {
            case 'weekly':
                let weeklyGrouped = _.groupBy(result, (item: any) => {
                    return item._id.week;
                });

                groupKeys = Object.keys(weeklyGrouped);

                series = _.map(groupKeys, (week: string) => {
                    return {
                        name: week,
                        data: this._organizeSeriesData(categories, weeklyGrouped[week])
                    };
                });

                    break;
            case 'monthly':
                let monthlyGrouped = _.groupBy(result, (item: any) => {
                    return item._id.month;
                });

                groupKeys = Object.keys(monthlyGrouped);

                series = _.map(groupKeys, (month: string) => {
                    return {
                        name: month,
                        data: this._organizeSeriesData(categories, monthlyGrouped[month])
                    };
                });

                break;
            case 'yearly':
                let yearlyGrouped = _.groupBy(result, (item: any) => {
                    return item._id.year;
                });

                series = _.map(groupKeys, (year: string) => {
                    return {
                        name: year,
                        data: this._organizeSeriesData(categories, yearlyGrouped[year])
                    };
                });

                break;
        }

        return {
            series: series,
            xAxis: { 'categories': categories }
        }

    }

    private _organizeSeriesData(categories: string[], data) {
        let that = this;
        let dataArray = [];

        categories.forEach(category => {
            let serieData = _.find(data, (item: any) => item._id.employee === category);
            dataArray.push(serieData ? serieData[that.modelLower] : 0);
        });

        return dataArray;
    }

    private _resolveAggregate(chart: IChartDocument, from: Date, to: Date) {
        let kpi: IKPI = chart.kpis[0];

        let group = { $group: this._processGroup(chart) };
        let match = { $match: this._processMatch(kpi.filter) };

        this._addDateRange(match, from, to);

        this.aggregate.push(match);

        let modelPathTokens = this.modelPath.split('.');

        let project = null;
        if (this.model.schema.tree[modelPathTokens[0]] instanceof Array) {
            project = {};

            if (chart.frequency) {
                project[MODEL_METADATA.Revenue.timestampField] = `$${MODEL_METADATA.Revenue.timestampField}`;
            }

            project[modelPathTokens[0]] = {
                $filter: {
                    input: `$${modelPathTokens[0]}`,
                    as: VARIABLE_NAME,
                    cond: this._processMatch(kpi.filter, modelPathTokens[0])
                }
            };

            this.aggregate.push({ $project: project});
        }

        this.aggregate.push({ $unwind: `$${modelPathTokens[0]}` });
        this.aggregate.push(group);

        this.aggregate.push({ $sort: this._processSorting(chart) });

        return this.aggregate;
    }

    private _processSorting(chart) {
        let sort = {
            '_id.id': 1,
            '_id.name': 1,
        };

        switch (chart.frequency) {
            case 'weekly':
                sort['week'] = 1;
                sort['year'] = 1;
                break;
            case 'monthly':
                sort['month'] = 1;
                sort['year'] = 1;
                break;
            case 'yearly':
                sort['year'] = 1;
                break;
        }

        return sort;
    }

    private _addDateRange(match, from: Date, to: Date) {
        let timestampField = MODEL_METADATA.Revenue.timestampField;
        match.$match[timestampField] = { $gte: new Date(from), $lte: new Date(to) };
    }

    private _processMatch(filter: string, objectFilter?: string) {
        let result = {};
        let exp = jsep(filter);

        if (exp.type === 'BinaryExpression') {
            result = this._processBinaryExpression(exp, objectFilter);
        } else if (exp.type === 'LogicalExpression') {
            result = this._processLogicalExpression(exp, objectFilter);
        }

        return result;

    }

    private _processGroup(chart: IChartDocument) {
        let kpi: IKPI = chart.kpis[0];

        let group: any = { };
        let parsed = jsep(kpi.formula);

        let aggregate = AGGREGATES_MAP[parsed.callee.name];

        // in case of average i need to do some magic here
        let path: string = null;
        let oper = parsed.arguments[0];
        if (aggregate === '$avg'
            && oper.type === 'BinaryExpression'
            && oper.operator === '/'
            && oper.right.operator === '@'
            && oper.right.argument.name === 'Total' ) {

            this.postProcessing = 'average';
            path = this._processMemberExpression(parsed.arguments[0].left);
        } else {
            path = this._processMemberExpression(parsed.arguments[0]);
        }

        let pathTokens = path.split('.');
        this.modelName = pathTokens[0];
        this.model = this._ctx[this.modelName];
        this.modelLower = this.modelName.toLowerCase();

        if (aggregate) {
            // _id / grouping
            group._id = kpi.grouping;
            this.modelPath = pathTokens.splice(1).join('.');

            if (chart.frequency) {
                // process grouping frequency
                switch (chart.frequency) {
                    case 'weekly':
                        group._id['week'] = { $week: `$${MODEL_METADATA.Revenue.timestampField}` };
                        // group._id['year'] = { $year: `$${MODEL_METADATA.Revenue.timestampField}` };
                        break;
                    case 'monthly':
                        group._id['month'] = { $month: `$${MODEL_METADATA.Revenue.timestampField}` };
                        // group._id['year'] = { $year: `$${MODEL_METADATA.Revenue.timestampField}` };
                        break;
                    case 'yearly':
                        group._id['year'] = { $year: `$${MODEL_METADATA.Revenue.timestampField}` };
                        break;
                }
            }

            // aggregate function
            let aggregation: any = group[this.modelLower] = {};
            let aggregationParameter = this.modelPath;

            if (this.postProcessing === 'average') {
                aggregation['$sum'] = `$${aggregationParameter}`;
            } else {
                aggregation[aggregate] = `$${aggregationParameter}`;
            }
        }

        return group;
    }

    private _processLogicalExpression(exp, objectFilter): any {
        let filter = {};
        let operator = OPERATOR_MAP[exp.operator];

        let leaf = filter[operator] = [];
        leaf.push(this._processExpressionSide(exp.left, objectFilter));
        leaf.push(this._processExpressionSide(exp.right, objectFilter));

        return filter;
    }

    private _processExpressionSide(exp, objectFilter) {
        if (exp.type === 'LogicalExpression') {
            return this._processLogicalExpression(exp, objectFilter);
        } else if (exp.type === 'BinaryExpression') {
            return this._processBinaryExpression(exp, objectFilter);
        }
    }

    private _processBinaryExpression(exp, objectFilter): any {
        let result = {};
        let operator = OPERATOR_MAP[exp.operator];
        let leftSideValue = exp.left.type === 'Literal'
            ? exp.left.raw
            : this._processMemberExpression(exp.left);

        let rightSideValue = exp.right.type === 'Literal'
            ? exp.right.value
            : this._processMemberExpression(exp.right);

        if (objectFilter) {
            if (this.modelPath.split('.')[0] !== objectFilter)
                return null;

            let leftSideFixed = leftSideValue.replace(objectFilter + '.', '$$$$' + VARIABLE_NAME + '.');
            result[OPERATOR_MAP[exp.operator]] = [leftSideFixed, rightSideValue];
        } else {
            let rightSide = {};
            rightSide[OPERATOR_MAP[exp.operator]] = rightSideValue;
            result[leftSideValue] = rightSide;
        }

        return result;
    }

    private _processMemberExpression(exp) {
        if (exp.type === 'Identifier') {
            return exp.name;
        }

        if (exp.type === 'MemberExpression') {
            let tempPath = this._processMemberExpression(exp.object);
            tempPath += '.' + exp.property.name;

            return tempPath;
        }

        return '';
    }
}