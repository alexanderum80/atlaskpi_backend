"use strict";
var GetAllKPIsQuery = (function () {
    function GetAllKPIsQuery(identity, _KPIModel) {
        this.identity = identity;
        this._KPIModel = _KPIModel;
    }
    // log = true;
    // audit = true;
    GetAllKPIsQuery.prototype.run = function (data) {
        return this._KPIModel.getAllKPIs(data);
    };
    return GetAllKPIsQuery;
}());
exports.GetAllKPIsQuery = GetAllKPIsQuery;
//# sourceMappingURL=get-all-kpis.query.js.map