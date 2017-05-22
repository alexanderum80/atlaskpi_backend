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
        $match: { 'product.type': { $eq: 'retail' } }
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
var RetailSales = (function (_super) {
    __extends(RetailSales, _super);
    function RetailSales(sales) {
        return _super.call(this, sales, aggregate) || this;
    }
    RetailSales.prototype.getData = function (dateRange, frequency) {
        var that = this;
        return this.executeQuery('product.from', dateRange, frequency).then(function (data) {
            return Promise.resolve(that._toSeries(data, frequency));
        });
    };
    RetailSales.prototype._toSeries = function (rawData, frequency) {
        var _this = this;
        if (!frequency) {
            return [{
                    name: 'Retail',
                    data: rawData.map(function (item) { return [null, item.sales]; })
                }];
        }
        else {
            var frequencies = _.uniq(rawData.map(function (item) { return item._id.frequency; })).sort();
            var years = _.uniq(frequencies.map(function (f) { return f.split('-')[0]; }));
            var result_1 = [];
            years.forEach(function (y) {
                var serie = { name: y,
                    data: _this._getRetalByYear(rawData, y) };
                result_1.push(serie);
            });
            return result_1;
        }
    };
    RetailSales.prototype._getRetalByYear = function (rawData, year) {
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
    return RetailSales;
}(kpi_base_1.KpiBase));
exports.RetailSales = RetailSales;
//# sourceMappingURL=retail-sales.js.map