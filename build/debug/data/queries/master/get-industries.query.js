"use strict";
var GetIndustriesQuery = (function () {
    function GetIndustriesQuery(identity, _IndustryModel) {
        this.identity = identity;
        this._IndustryModel = _IndustryModel;
    }
    // log = true;
    // audit = true;
    GetIndustriesQuery.prototype.run = function (data) {
        return this._IndustryModel.findAll();
    };
    return GetIndustriesQuery;
}());
exports.GetIndustriesQuery = GetIndustriesQuery;
//# sourceMappingURL=get-industries.query.js.map