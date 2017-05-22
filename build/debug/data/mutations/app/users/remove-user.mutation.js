"use strict";
var RemoveUserMutation = (function () {
    function RemoveUserMutation(identity, _UserModel) {
        this.identity = identity;
        this._UserModel = _UserModel;
    }
    // log = true;
    // audit = true;
    RemoveUserMutation.prototype.run = function (data) {
        return this._UserModel.removeUser(data.id);
    };
    return RemoveUserMutation;
}());
exports.RemoveUserMutation = RemoveUserMutation;
//# sourceMappingURL=remove-user.mutation.js.map