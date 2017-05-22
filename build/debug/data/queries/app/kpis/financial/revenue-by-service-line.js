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
        $match: {}
    },
    {
        frequency: true,
        $project: {
            'product': 1,
            'category': 1,
            '_id': 0
        }
    },
    {
        frequency: true,
        $group: {
            _id: { category: '$category.name' },
            sales: { $sum: '$product.price' }
        }
    },
    {
        $sort: {
            frequency: 1
        }
    }
];
var RevenueByServiceLine = (function (_super) {
    __extends(RevenueByServiceLine, _super);
    function RevenueByServiceLine(sales) {
        return _super.call(this, sales, aggregate) || this;
    }
    RevenueByServiceLine.prototype.getData = function (dateRange, frequency) {
        var that = this;
        return new Promise(function (resolve, reject) {
            that.executeQuery('product.from', dateRange, frequency).then(function (data) {
                resolve(that._toSeries(data));
            }, function (e) { return reject(e); });
        });
    };
    RevenueByServiceLine.prototype._toSeries = function (rawData) {
        var data = _(rawData)
            .groupBy('_id.category')
            .map(function (v, k) { return ({
            category: k,
            sales: _.sumBy(v, 'sales')
        }); })
            .value()
            .map(function (item) { return [item.category, item.sales]; });
        var result = [{
                name: 'Revenue',
                data: data
            }];
        return result;
    };
    return RevenueByServiceLine;
}(kpi_base_1.KpiBase));
exports.RevenueByServiceLine = RevenueByServiceLine;
//# sourceMappingURL=revenue-by-service-line.js.map