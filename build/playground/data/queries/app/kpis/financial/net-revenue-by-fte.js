"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var kpi_base_1 = require("../kpi-base");
var Promise = require("bluebird");
var _ = require("lodash");
var aggregate = [{
        dateRange: true,
        $match: {
            'employee.type': {
                '$eq': 'f'
            }
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
            _id: {
                employeeId: '$employee.externalId',
                name: '$employee.name',
                employeeLastname: '$employee.lastName'
            },
            sales: {
                $sum: '$product.price'
            }
        }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];
var NetRevenueByFTE = (function (_super) {
    __extends(NetRevenueByFTE, _super);
    function NetRevenueByFTE(sales) {
        return _super.call(this, sales, aggregate) || this;
    }
    NetRevenueByFTE.prototype.getData = function (dateRange, frequency) {
        var that = this;
        return new Promise(function (resolve, reject) {
            that.executeQuery('product.from', dateRange, frequency).then(function (data) {
                resolve(that._toSeries(data, frequency));
            }, function (e) { return reject(e); });
        });
    };
    NetRevenueByFTE.prototype._toSeries = function (rawData, frequency) {
        if (!frequency) {
            return [{
                    name: 'Net Revenue',
                    data: rawData.map(function (item) { return [item._id.name, item.sales]; })
                }];
        }
        else {
            var frequencies_1 = _.uniq(rawData.map(function (item) { return item._id.frequency; })).sort();
            var employees_1 = this._top5Employees(rawData);
            var data = rawData.filter(function (item, index) {
                if (frequencies_1.indexOf(item._id.frequency) === -1 ||
                    employees_1.indexOf(item._id.name) === -1) {
                    return;
                }
                ;
                return item;
            });
            data = _.orderBy(data, ['_id.frequency', 'sales'], ['asc', 'desc']);
            data = _(data)
                .groupBy('_id.name')
                .map(function (v, k) { return ({
                name: k,
                data: v.map(function (item) { return [item._id.frequency, item.sales]; })
            }); })
                .value();
            return data;
        }
        // return [{
        //       name: 'Net Revenue',
        //       data: rawData.map(item => [ item._id.employeeId, item.sales ])
        //   }];
        // }
    };
    NetRevenueByFTE.prototype._top5Employees = function (rawData) {
        return _(rawData)
            .groupBy('_id.name')
            .map(function (v, k) { return ({
            name: k,
            sales: _.sumBy(v, 'sales')
        }); })
            .orderBy('sales', 'desc')
            .filter(function (item, index) {
            if (index > 4) {
                return;
            }
            ;
            return item;
        })
            .map(function (item) { return item.name; });
    };
    return NetRevenueByFTE;
}(kpi_base_1.KpiBase));
exports.NetRevenueByFTE = NetRevenueByFTE;
//# sourceMappingURL=net-revenue-by-fte.js.map