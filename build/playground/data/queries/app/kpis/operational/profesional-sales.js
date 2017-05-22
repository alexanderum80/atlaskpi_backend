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
        $match: { 'category.service': { '$eq': 1 } }
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
var ProfesionalSales = (function (_super) {
    __extends(ProfesionalSales, _super);
    function ProfesionalSales(sales) {
        return _super.call(this, sales, aggregate) || this;
    }
    ProfesionalSales.prototype.getData = function (dateRange, frequency) {
        return this.executeQuery('product.from', dateRange, frequency);
    };
    return ProfesionalSales;
}(kpi_base_1.KpiBase));
exports.ProfesionalSales = ProfesionalSales;
//# sourceMappingURL=profesional-sales.js.map