"use strict";
var Promise = require("bluebird");
exports.PaginationDetailsDefault = {
    page: 1,
    itemsPerPage: 25,
    sortBy: null
};
/**
 * Paginator encapsulate the logic to execute mongodb queries and
 * return results in pages
 */
var Paginator = (function () {
    function Paginator(_model, _filterPaths, _projection) {
        this._model = _model;
        this._filterPaths = _filterPaths;
        this._projection = _projection;
    }
    Paginator.prototype.getPage = function (paging) {
        if (paging.details) {
            paging = Object.assign({}, exports.PaginationDetailsDefault, paging.details);
        }
        else {
            paging = Object.assign({}, exports.PaginationDetailsDefault, paging);
        }
        var that = this;
        var filter = this.getFilter(paging.filter);
        var getDataPromise = this._getData(paging);
        var getCountPromise = this._getCount(filter);
        return Promise.all([getDataPromise, getCountPromise]).then(function () {
            return {
                pagination: {
                    itemsPerPage: paging.itemsPerPage,
                    currentPage: paging.page,
                    totalItems: that._count
                },
                data: that._data
            };
        });
    };
    Paginator.prototype.getFilter = function (filter, caseSensitive) {
        if (!this._filterPaths) {
            return {};
        }
        var exp = new RegExp(filter);
        var conditions = [];
        this._filterPaths.forEach(function (f) {
            var condition = {};
            condition[f] = { $regex: exp };
            if (!caseSensitive) {
                condition[f].$options = 'i';
            }
            conditions.push(condition);
        });
        return conditions.length > 0 ? { $or: conditions } : {};
    };
    Paginator.prototype._getData = function (paging) {
        var _this = this;
        var that = this;
        return new Promise(function (resolve, reject) {
            var filterObj = _this.getFilter(paging.filter);
            var skip = (paging.page - 1) * paging.itemsPerPage;
            _this._model.find(filterObj, _this._projection || {})
                .skip(skip)
                .limit(paging.itemsPerPage)
                .sort(paging.sortBy)
                .then(function (res) {
                that._data = res;
                resolve(res);
            });
        });
    };
    Paginator.prototype._getCount = function (filter) {
        var _this = this;
        var that = this;
        return new Promise(function (resolve, reject) {
            _this._model.count(filter).then(function (count) {
                that._count = count;
                resolve(count);
            });
        });
    };
    return Paginator;
}());
exports.Paginator = Paginator;
//# sourceMappingURL=pagination.js.map