"use strict";
var Promise = require("bluebird");
var model_metadata_1 = require("./model-metadata");
var _ = require("lodash");
var jsep = require('jsep');
// add custom parser
jsep.addUnaryOp('@');
// export interface IChart
var OPERATOR_MAP = {
    '&&': '$and',
    '>': '$gt',
    '<': '$lt',
    '>=': '$gte',
    '<=': '$lte',
    '==': '$eq',
    '||': '$or',
    '!=': '$ne'
};
var AGGREGATES_MAP = {
    Sum: '$sum',
    Avg: '$avg'
};
var VARIABLE_NAME = 'item';
var ChartProcessor = (function () {
    function ChartProcessor(_ctx) {
        this._ctx = _ctx;
        this.aggregate = [];
    }
    ChartProcessor.prototype.getChartDefinition = function (data) {
        var _this = this;
        var that = this;
        return new Promise(function (resolve, reject) {
            // get chart
            _this._ctx.Chart.findById(data.id)
                .populate('kpis')
                .exec(function (err, chart) {
                if (err) {
                    reject(err);
                    return;
                }
                if (!chart) {
                    reject({ message: 'Chart not found' });
                    return;
                }
                that._getData(chart, data.from, data.to).then(function (graphData) {
                    chart.chartDefinition.xAxis = graphData.xAxis;
                    chart.chartDefinition.series = graphData.series;
                    resolve(chart.chartDefinition);
                });
            });
        });
    };
    ChartProcessor.prototype._getData = function (chart, from, to) {
        var _this = this;
        var that = this;
        var kpi = chart.kpis[0];
        var aggregate = that._resolveAggregate(chart, from, to);
        // update chart data
        chart.chartDefinition.title.text = kpi.name;
        chart.chartDefinition.subtitle.text = '';
        return new Promise(function (resolve, reject) {
            _this.model.aggregate(aggregate).then(function (result) {
                if (that.postProcessing === 'average') {
                    var count_1 = result.length;
                    result.forEach(function (item) {
                        item[that.modelLower] = item[that.modelLower] / count_1;
                    });
                }
                var series = that._processSeries(kpi, chart.frequency, result);
                resolve(series);
            }, function (err) {
                reject(err);
            });
        });
    };
    ChartProcessor.prototype._processSeries = function (kpi, frequency, result) {
        var _this = this;
        var categories = _.uniq(result.map(function (item) { return item['_id'][kpi.axisSelection]; }));
        if (!frequency) {
            return {
                series: [{
                        name: this.modelName,
                        data: result.map(function (item) { return item[_this.modelLower]; })
                    }],
                xAxis: { 'categories': categories }
            };
        }
        // let categories = _.sortBy(_.uniq(result.map(item => item['_id'][kpi.axisSelection])));
        // process frequency
        var series;
        var xAxis;
        var groupKeys;
        switch (frequency) {
            case 'weekly':
                var weeklyGrouped_1 = _.groupBy(result, function (item) {
                    return item._id.week;
                });
                groupKeys = Object.keys(weeklyGrouped_1);
                series = _.map(groupKeys, function (week) {
                    return {
                        name: week,
                        data: _this._organizeSeriesData(categories, weeklyGrouped_1[week])
                    };
                });
                break;
            case 'monthly':
                var monthlyGrouped_1 = _.groupBy(result, function (item) {
                    return item._id.month;
                });
                groupKeys = Object.keys(monthlyGrouped_1);
                series = _.map(groupKeys, function (month) {
                    return {
                        name: month,
                        data: _this._organizeSeriesData(categories, monthlyGrouped_1[month])
                    };
                });
                break;
            case 'yearly':
                var yearlyGrouped_1 = _.groupBy(result, function (item) {
                    return item._id.year;
                });
                series = _.map(groupKeys, function (year) {
                    return {
                        name: year,
                        data: _this._organizeSeriesData(categories, yearlyGrouped_1[year])
                    };
                });
                break;
        }
        return {
            series: series,
            xAxis: { 'categories': categories }
        };
    };
    ChartProcessor.prototype._organizeSeriesData = function (categories, data) {
        var that = this;
        var dataArray = [];
        categories.forEach(function (category) {
            var serieData = _.find(data, function (item) { return item._id.employee === category; });
            dataArray.push(serieData ? serieData[that.modelLower] : 0);
        });
        return dataArray;
    };
    ChartProcessor.prototype._resolveAggregate = function (chart, from, to) {
        var kpi = chart.kpis[0];
        var group = { $group: this._processGroup(chart) };
        var match = { $match: this._processMatch(kpi.filter) };
        this._addDateRange(match, from, to);
        this.aggregate.push(match);
        var modelPathTokens = this.modelPath.split('.');
        var project = null;
        if (this.model.schema.tree[modelPathTokens[0]] instanceof Array) {
            project = {};
            if (chart.frequency) {
                project[model_metadata_1.MODEL_METADATA.Revenue.timestampField] = "$" + model_metadata_1.MODEL_METADATA.Revenue.timestampField;
            }
            project[modelPathTokens[0]] = {
                $filter: {
                    input: "$" + modelPathTokens[0],
                    as: VARIABLE_NAME,
                    cond: this._processMatch(kpi.filter, modelPathTokens[0])
                }
            };
            this.aggregate.push({ $project: project });
        }
        this.aggregate.push({ $unwind: "$" + modelPathTokens[0] });
        this.aggregate.push(group);
        this.aggregate.push({ $sort: this._processSorting(chart) });
        return this.aggregate;
    };
    ChartProcessor.prototype._processSorting = function (chart) {
        var sort = {
            '_id.id': 1,
            '_id.name': 1
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
    };
    ChartProcessor.prototype._addDateRange = function (match, from, to) {
        var timestampField = model_metadata_1.MODEL_METADATA.Revenue.timestampField;
        match.$match[timestampField] = { $gte: new Date(from), $lte: new Date(to) };
    };
    ChartProcessor.prototype._processMatch = function (filter, objectFilter) {
        var result = {};
        var exp = jsep(filter);
        if (exp.type === 'BinaryExpression') {
            result = this._processBinaryExpression(exp, objectFilter);
        }
        else if (exp.type === 'LogicalExpression') {
            result = this._processLogicalExpression(exp, objectFilter);
        }
        return result;
    };
    ChartProcessor.prototype._processGroup = function (chart) {
        var kpi = chart.kpis[0];
        var group = {};
        var parsed = jsep(kpi.formula);
        var aggregate = AGGREGATES_MAP[parsed.callee.name];
        // in case of average i need to do some magic here
        var path = null;
        var oper = parsed.arguments[0];
        if (aggregate === '$avg'
            && oper.type === 'BinaryExpression'
            && oper.operator === '/'
            && oper.right.operator === '@'
            && oper.right.argument.name === 'Total') {
            this.postProcessing = 'average';
            path = this._processMemberExpression(parsed.arguments[0].left);
        }
        else {
            path = this._processMemberExpression(parsed.arguments[0]);
        }
        var pathTokens = path.split('.');
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
                        group._id['week'] = { $week: "$" + model_metadata_1.MODEL_METADATA.Revenue.timestampField };
                        // group._id['year'] = { $year: `$${MODEL_METADATA.Revenue.timestampField}` };
                        break;
                    case 'monthly':
                        group._id['month'] = { $month: "$" + model_metadata_1.MODEL_METADATA.Revenue.timestampField };
                        // group._id['year'] = { $year: `$${MODEL_METADATA.Revenue.timestampField}` };
                        break;
                    case 'yearly':
                        group._id['year'] = { $year: "$" + model_metadata_1.MODEL_METADATA.Revenue.timestampField };
                        break;
                }
            }
            // aggregate function
            var aggregation = group[this.modelLower] = {};
            var aggregationParameter = this.modelPath;
            if (this.postProcessing === 'average') {
                aggregation['$sum'] = "$" + aggregationParameter;
            }
            else {
                aggregation[aggregate] = "$" + aggregationParameter;
            }
        }
        return group;
    };
    ChartProcessor.prototype._processLogicalExpression = function (exp, objectFilter) {
        var filter = {};
        var operator = OPERATOR_MAP[exp.operator];
        var leaf = filter[operator] = [];
        leaf.push(this._processExpressionSide(exp.left, objectFilter));
        leaf.push(this._processExpressionSide(exp.right, objectFilter));
        return filter;
    };
    ChartProcessor.prototype._processExpressionSide = function (exp, objectFilter) {
        if (exp.type === 'LogicalExpression') {
            return this._processLogicalExpression(exp, objectFilter);
        }
        else if (exp.type === 'BinaryExpression') {
            return this._processBinaryExpression(exp, objectFilter);
        }
    };
    ChartProcessor.prototype._processBinaryExpression = function (exp, objectFilter) {
        var result = {};
        var operator = OPERATOR_MAP[exp.operator];
        var leftSideValue = exp.left.type === 'Literal'
            ? exp.left.raw
            : this._processMemberExpression(exp.left);
        var rightSideValue = exp.right.type === 'Literal'
            ? exp.right.value
            : this._processMemberExpression(exp.right);
        if (objectFilter) {
            if (this.modelPath.split('.')[0] !== objectFilter)
                return null;
            var leftSideFixed = leftSideValue.replace(objectFilter + '.', '$$$$' + VARIABLE_NAME + '.');
            result[OPERATOR_MAP[exp.operator]] = [leftSideFixed, rightSideValue];
        }
        else {
            var rightSide = {};
            rightSide[OPERATOR_MAP[exp.operator]] = rightSideValue;
            result[leftSideValue] = rightSide;
        }
        return result;
    };
    ChartProcessor.prototype._processMemberExpression = function (exp) {
        if (exp.type === 'Identifier') {
            return exp.name;
        }
        if (exp.type === 'MemberExpression') {
            var tempPath = this._processMemberExpression(exp.object);
            tempPath += '.' + exp.property.name;
            return tempPath;
        }
        return '';
    };
    return ChartProcessor;
}());
exports.ChartProcessor = ChartProcessor;
//# sourceMappingURL=chart-processor.js.map