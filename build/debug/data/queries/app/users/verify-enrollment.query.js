"use strict";
var VerifyEnrollmentQuery = (function () {
    function VerifyEnrollmentQuery(identity, _UserModel) {
        this.identity = identity;
        this._UserModel = _UserModel;
    }
    // log = true;
    // audit = true;
    VerifyEnrollmentQuery.prototype.run = function (data) {
        return this._UserModel.verifyEnrollmentToken(data.token);
    };
    return VerifyEnrollmentQuery;
}());
exports.VerifyEnrollmentQuery = VerifyEnrollmentQuery;
//# sourceMappingURL=verify-enrollment.query.js.map