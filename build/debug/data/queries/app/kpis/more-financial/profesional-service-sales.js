"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var kpi_base_1 = require("../kpi-base");
var Promise = require("bluebird");
var aggregate = [
    {
        dateRange: true,
        $match: { 'product.type': { '$eq': 'service' } }
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
            revenue: { $sum: '$product.price' }
        }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];
var ProfesionalServiceSales = (function (_super) {
    __extends(ProfesionalServiceSales, _super);
    function ProfesionalServiceSales(sales, _preProcesingKpi) {
        if (_preProcesingKpi === void 0) { _preProcesingKpi = false; }
        var _this = _super.call(this, sales, aggregate) || this;
        _this._preProcesingKpi = _preProcesingKpi;
        return _this;
    }
    ProfesionalServiceSales.prototype.getData = function (dateRange, frequency) {
        var that = this;
        return new Promise(function (resolve, reject) {
            that.executeQuery('product.from', dateRange, frequency).then(function (data) {
                if (that._preProcesingKpi) {
                    resolve(data);
                }
                else {
                    resolve(that._toSeries(data));
                }
            }), function (e) { return reject(e); };
        });
    };
    ProfesionalServiceSales.prototype._toSeries = function (rawData) {
        return [{
                name: 'Profesional Service Sales',
                data: rawData.map(function (item) { return [item._id.frequency, item.revenue]; })
            }];
    };
    return ProfesionalServiceSales;
}(kpi_base_1.KpiBase));
exports.ProfesionalServiceSales = ProfesionalServiceSales;
//# sourceMappingURL=profesional-service-sales.js.map