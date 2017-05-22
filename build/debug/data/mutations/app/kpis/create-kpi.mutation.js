"use strict";
var CreateKPIMutation = (function () {
    function CreateKPIMutation(identity, _KPIModel) {
        this.identity = identity;
        this._KPIModel = _KPIModel;
    }
    // log = true;
    // audit = true;
    CreateKPIMutation.prototype.run = function (data) {
        return this._KPIModel.createKPI(data.data);
    };
    return CreateKPIMutation;
}());
exports.CreateKPIMutation = CreateKPIMutation;
//# sourceMappingURL=create-kpi.mutation.js.map