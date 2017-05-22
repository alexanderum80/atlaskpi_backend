"use strict";
var frequency_enum_1 = require("../../../models/common/frequency-enum");
var Promise = require("bluebird");
var KpiBase = (function () {
    function KpiBase(model, aggregate) {
        this.model = model;
        this.aggregate = aggregate;
    }
    KpiBase.prototype.executeQuery = function (dateField, dateRange, frequency) {
        var _this = this;
        if (!this.model)
            throw 'A model is required to execute kpi query';
        if (!dateField)
            throw 'A date field is required to execute kpi query';
        var that = this;
        return new Promise(function (resolve, reject) {
            if (dateRange)
                that._injectDataRange(dateRange, dateField);
            if (frequency)
                that._injectFrequency(frequency, dateField);
            // decompose aggregate object into array
            var aggregateParameters = [];
            that.aggregate.forEach(function (stageOperator) {
                var operator = _this._getAggregateOperator(stageOperator);
                aggregateParameters.push(operator);
            });
            (_a = _this.model).aggregate.apply(_a, aggregateParameters).then(function (data) {
                resolve(data);
            }, function (e) {
                reject(e);
            });
            var _a;
        });
    };
    KpiBase.prototype.findStage = function (booleanField, stageOperator) {
        return this.aggregate.find(function (s) { return s[booleanField] === true && s[stageOperator] !== undefined; });
    };
    KpiBase.prototype.findStages = function (stageOperator) {
        return this.aggregate.filter(function (s) { return s[stageOperator] !== undefined; });
    };
    KpiBase.prototype._getAggregateOperator = function (stage) {
        var operator;
        var operators = [
            '$match', '$project', '$group', '$sort', '$redact', '$limit', '$skip', '$unwind', '$sample',
            '$geoNear', '$lookup', '$out', '$sortByCount', '$addFields', '$count'
        ];
        Object.keys(stage).forEach(function (k) {
            if (operators.indexOf(k) !== -1) {
                operator = {};
                operator[k] = stage[k];
            }
        });
        return operator;
    };
    KpiBase.prototype._injectDataRange = function (dateRange, field) {
        // find date range sectiopn or first $match section instead
        var matchStage = this.findStage('dateRange', '$match');
        if (!matchStage) {
            throw 'KpiBase#_injectDataRange: Cannot inject date range because a dateRAnge/$match stage could not be found';
        }
        // apply date range
        if (dateRange) {
            matchStage.$match[field] = { '$gte': dateRange.from, '$lte': dateRange.to };
        }
    };
    KpiBase.prototype._injectFrequency = function (frequency, field) {
        if (!frequency)
            return;
        field = '$' + field;
        var groupStage = this.findStage('frequency', '$group');
        if (!groupStage) {
            this.aggregate.push({ $group: { _id: {} } });
            groupStage = this.findStage('frequency', '$group');
        }
        if (!groupStage.$group._id) {
            groupStage.$group._id = {};
        }
        var currentGrouping;
        var projectStage = this.findStage('frequency', '$project');
        if (!projectStage)
            throw 'An aggregate needs a project operator defined for a frequency';
        switch (frequency) {
            case frequency_enum_1.FrequencyEnum.Weekly:
                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: { $week: field } };
                break;
            case frequency_enum_1.FrequencyEnum.Monthly:
                if (!projectStage.$project)
                    projectStage.$project = {};
                // add to the projection the frequency field with year and month: YYYY-MM
                projectStage.$project.frequency = {
                    $concat: [
                        { $substr: [{ $year: field }, 0, 4] },
                        '-',
                        { $cond: [
                                { $lte: [{ $month: field }, 9] },
                                { $concat: [
                                        '0', { $substr: [{ $month: field }, 0, 2] }
                                    ] },
                                { $substr: [{ $month: field }, 0, 2] }
                            ] }
                    ]
                };
                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: '$frequency' };
                break;
            case frequency_enum_1.FrequencyEnum.Quartely:
                // I need to add a projection if it does not exist
                if (!projectStage.$project)
                    projectStage.$project = {};
                projectStage.$project.frequency = {
                    $concat: [
                        { $substr: [{ $year: field }, 0, 4] },
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
            case frequency_enum_1.FrequencyEnum.Yearly:
                delete groupStage.$group._id.frequency;
                currentGrouping = groupStage.$group._id;
                groupStage.$group._id = { frequency: { $year: field } };
                break;
        }
        var that = this;
        // restore the rest of the grouping if there is anything to restore
        if (!currentGrouping)
            return;
        Object.keys(currentGrouping).forEach(function (prop) {
            groupStage.$group._id[prop] = currentGrouping[prop];
        });
    };
    return KpiBase;
}());
exports.KpiBase = KpiBase;
//# sourceMappingURL=kpi-base.js.map