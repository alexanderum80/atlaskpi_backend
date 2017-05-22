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
        $match: { 'location.name': { $eq: 'Ambulatory Surgery Center Sales' } }
    },
    {
        frequency: true,
        $project: { _id: 0, product: 1 }
    },
    {
        frequency: true,
        $group: { _id: null, 'revenue': { $sum: '$product.price' } }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];
var AmbulatorySurgeryCenterSales = (function (_super) {
    __extends(AmbulatorySurgeryCenterSales, _super);
    function AmbulatorySurgeryCenterSales(sales, _preProcesingKpi) {
        if (_preProcesingKpi === void 0) { _preProcesingKpi = false; }
        var _this = _super.call(this, sales, aggregate) || this;
        _this._preProcesingKpi = _preProcesingKpi;
        return _this;
    }
    AmbulatorySurgeryCenterSales.prototype.getData = function (dateRange, frequency) {
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
    AmbulatorySurgeryCenterSales.prototype._toSeries = function (rawData) {
        return [{
                name: 'Ambulatory Surgery Center Sales',
                data: rawData.map(function (item) { return [item._id.frequency, item.revenue]; })
            }];
    };
    return AmbulatorySurgeryCenterSales;
}(kpi_base_1.KpiBase));
exports.AmbulatorySurgeryCenterSales = AmbulatorySurgeryCenterSales;
//# sourceMappingURL=ambulatory-surgery-center-sales.js.map