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
            _id: { product: '$product.name' },
            sales: { $sum: '$product.price' }
        }
    },
    {
        $sort: {
            frequency: 1
        }
    }
];
var SalesByProduct = (function (_super) {
    __extends(SalesByProduct, _super);
    function SalesByProduct(sales) {
        return _super.call(this, sales, aggregate) || this;
    }
    SalesByProduct.prototype.getData = function (dateRange, frequency) {
        var that = this;
        return this.executeQuery('product.from', dateRange, frequency).then(function (data) {
            // console.log(JSON.stringify(that._toSeries(data, frequency)));
            return Promise.resolve(that._toSeries(data, frequency));
        });
    };
    SalesByProduct.prototype._toSeries = function (rawData, frequency) {
        // console.log(JSON.stringify(rawData));
        if (!frequency) {
            return [{
                    name: 'Sales',
                    data: _.orderBy(rawData, ['sales'], ['desc'])
                        .filter(function (item, index) {
                        if (index > 9) {
                            return;
                        }
                        ;
                        return item;
                    })
                        .map(function (item) { return [item._id.product, item.sales]; })
                }];
        }
        else {
            var frequencies_1 = _.uniq(rawData.map(function (item) { return item._id.frequency; })).sort();
            var products_1 = this._topTenBestSeller(rawData);
            var data = rawData.filter(function (item, index) {
                if (frequencies_1.indexOf(item._id.frequency) === -1 ||
                    products_1.indexOf(item._id.product) === -1) {
                    return;
                }
                ;
                return item;
            });
            data = _.orderBy(data, ['_id.frequency', 'sales'], ['asc', 'desc']);
            data = _(data)
                .groupBy('_id.product')
                .map(function (v, k) { return ({
                name: k,
                data: v.map(function (item) { return [item._id.frequency, item.sales]; })
            }); })
                .value();
            return data;
        }
    };
    SalesByProduct.prototype._topTenBestSeller = function (rawData) {
        return _(rawData)
            .groupBy('_id.product')
            .map(function (v, k) { return ({
            product: k,
            sales: _.sumBy(v, 'sales')
        }); })
            .orderBy('sales', 'desc')
            .filter(function (item, index) {
            if (index > 9) {
                return;
            }
            ;
            return item;
        })
            .map(function (item) { return item.product; });
    };
    return SalesByProduct;
}(kpi_base_1.KpiBase));
exports.SalesByProduct = SalesByProduct;
//# sourceMappingURL=sales-by-product.js.map