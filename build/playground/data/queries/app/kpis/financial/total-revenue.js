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
        $sort: {
            frequency: 1
        }
    }
];
var TotalRevenue = (function (_super) {
    __extends(TotalRevenue, _super);
    function TotalRevenue(sales) {
        return _super.call(this, sales, aggregate) || this;
    }
    TotalRevenue.prototype.getData = function (dateRange, frequency) {
        var that = this;
        return this.executeQuery('product.from', dateRange, frequency).then(function (data) {
            return Promise.resolve(that._toSeries(data, frequency));
        });
    };
    TotalRevenue.prototype._toSeries = function (rawData, frequency) {
        var _this = this;
        var frequencies = _.uniq(rawData.map(function (item) { return item._id.frequency; })).sort();
        var years = _.uniq(frequencies.map(function (f) { return f.split('-')[0]; }));
        var result = [];
        years.forEach(function (y) {
            var serie = { name: y,
                data: _this._getRevenueByYear(rawData, y) };
            result.push(serie);
        });
        return result;
    };
    TotalRevenue.prototype._getRevenueByYear = function (rawData, year) {
        var data = rawData.filter(function (d) {
            if (d._id.frequency.indexOf(year) === -1) {
                return;
            }
            ;
            return d;
        });
        data = _.sortBy(data, '_id.frequency');
        return data.map(function (item) { return [item._id.frequency, item.sales]; });
    };
    return TotalRevenue;
}(kpi_base_1.KpiBase));
exports.TotalRevenue = TotalRevenue;
//# sourceMappingURL=total-revenue.js.map