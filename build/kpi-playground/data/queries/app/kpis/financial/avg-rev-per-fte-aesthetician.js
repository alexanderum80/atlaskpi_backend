"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var kpi_base_1 = require("../kpi-base");
var Promise = require("bluebird");
var _ = require("lodash");
var aggregate = [
    {
        dateRange: true,
        $match: {
            'employee.type': { $eq: 'f' },
            'employee.role': { $eq: 'Aesthetician' }
        }
    },
    {
        frequency: true,
        $project: {
            'product': 1,
            'employee': 1,
            '_id': 0
        }
    },
    {
        frequency: true,
        $group: {
            _id: null,
            sales: { $sum: '$product.price' }
        }
    },
    {
        $project: {
            avg: {
                $divide: ['$sales']
            }
        }
    },
    {
        $sort: {
            frequency: 1
        }
    }
];
var AvgRevenueByFTAesthetician = (function (_super) {
    __extends(AvgRevenueByFTAesthetician, _super);
    function AvgRevenueByFTAesthetician(sales) {
        return _super.call(this, sales, aggregate) || this;
    }
    AvgRevenueByFTAesthetician.prototype.getData = function (dateRange, frequency) {
        var _this = this;
        var that = this;
        return new Promise(function (resolve, reject) {
            // get total physicians first
            var query = _this.findStage('dateRange', '$match').$match;
            query['product.from'] = { '$gte': dateRange.from, '$lte': dateRange.to };
            _this.model.find(query).distinct('employee.externalId', function (err, employeeIds) {
                var totalEmployees = employeeIds ? employeeIds.length : 0;
                var projectStages = that.findStages('$project');
                var divideArg1 = projectStages[1].$project.avg.$divide[0];
                projectStages[1].$project.avg.$divide = [
                    divideArg1,
                    totalEmployees
                ];
                that.executeQuery('product.from', dateRange, frequency).then(function (data) {
                    resolve(that._toSeries(data));
                })["catch"](function (e) {
                    console.error(e);
                });
            });
        });
    };
    AvgRevenueByFTAesthetician.prototype._toSeries = function (rawData) {
        return [{
                name: 'Avg',
                data: _.sortBy(rawData, '_id.frequency')
                    .map(function (item) { return [item._id.frequency, item.avg]; })
            }];
    };
    return AvgRevenueByFTAesthetician;
}(kpi_base_1.KpiBase));
exports.AvgRevenueByFTAesthetician = AvgRevenueByFTAesthetician;
//# sourceMappingURL=avg-rev-per-fte-aesthetician.js.map