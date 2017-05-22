"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var kpi_base_1 = require("../kpi-base");
var aggregate = [
    {
        dateRange: true,
        $match: {}
    },
    {
        frequency: true,
        $project: { _id: 0, product: 1 }
    },
    {
        frequency: true,
        $group: { revenue: { $sum: '$product.price' } }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];
var TotalRevenue = (function (_super) {
    __extends(TotalRevenue, _super);
    function TotalRevenue(sales) {
        return _super.call(this, sales, aggregate) || this;
    }
    TotalRevenue.prototype.getData = function (dateRange, frequency) {
        return this.executeQuery('product.from', dateRange, frequency);
    };
    return TotalRevenue;
}(kpi_base_1.KpiBase));
exports.TotalRevenue = TotalRevenue;
//# sourceMappingURL=total-revenue.js.map