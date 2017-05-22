"use strict";
var CreateBusinessUnitMutation = (function () {
    function CreateBusinessUnitMutation(identity, _BusinessUnitModel) {
        this.identity = identity;
        this._BusinessUnitModel = _BusinessUnitModel;
    }
    // log = true;
    // audit = true;
    CreateBusinessUnitMutation.prototype.run = function (data) {
        // details object inside graphql data object
        return this._BusinessUnitModel.createBusinessUnit(data.details);
    };
    return CreateBusinessUnitMutation;
}());
exports.CreateBusinessUnitMutation = CreateBusinessUnitMutation;
//# sourceMappingURL=create-business-unit.mutation.js.map