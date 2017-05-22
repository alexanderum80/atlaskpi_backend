"use strict";
var RemoveKPIMutation = (function () {
    function RemoveKPIMutation(identity, _KPIModel) {
        this.identity = identity;
        this._KPIModel = _KPIModel;
    }
    // log = true;
    // audit = true;
    RemoveKPIMutation.prototype.run = function (data) {
        return this._KPIModel.removeKPI(data.id);
    };
    return RemoveKPIMutation;
}());
exports.RemoveKPIMutation = RemoveKPIMutation;
//# sourceMappingURL=remove-kpi.mutation.js.map