"use strict";
var ListAllBusinessUnitsQuery = (function () {
    function ListAllBusinessUnitsQuery(identity, _BusinessUnitModel) {
        this.identity = identity;
        this._BusinessUnitModel = _BusinessUnitModel;
    }
    // log = true;
    // audit = true;
    ListAllBusinessUnitsQuery.prototype.run = function (data) {
        // details object inside graphql data object
        return this._BusinessUnitModel.allBusinessUnits(data.details);
    };
    return ListAllBusinessUnitsQuery;
}());
exports.ListAllBusinessUnitsQuery = ListAllBusinessUnitsQuery;
//# sourceMappingURL=list-all-business-units.query.js.map