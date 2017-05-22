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
        $match: { $or: [{ 'category.name': { $regex: 'Consulting', $options: 'i' } }, { 'category.name': { $regex: 'Research', $options: 'i' } }] }
    },
    {
        frequency: true,
        $project: { product: 1 }
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
var ConsultingResearchSales = (function (_super) {
    __extends(ConsultingResearchSales, _super);
    function ConsultingResearchSales(sales, _preProcesingKpi) {
        if (_preProcesingKpi === void 0) { _preProcesingKpi = false; }
        var _this = _super.call(this, sales, aggregate) || this;
        _this._preProcesingKpi = _preProcesingKpi;
        return _this;
    }
    ConsultingResearchSales.prototype.getData = function (dateRange, frequency) {
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
    ConsultingResearchSales.prototype._toSeries = function (rawData) {
        return [{
                name: 'Consulting Research Sales',
                data: rawData.map(function (item) { return [item._id.frequency, item.revenue]; })
            }];
    };
    return ConsultingResearchSales;
}(kpi_base_1.KpiBase));
exports.ConsultingResearchSales = ConsultingResearchSales;
//# sourceMappingURL=consulting-research-sales.js.map