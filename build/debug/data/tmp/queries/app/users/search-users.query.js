"use strict";
var SearchUsersQuery = (function () {
    function SearchUsersQuery(identity, _UserModel) {
        this.identity = identity;
        this._UserModel = _UserModel;
    }
    // log = true;
    // audit = true;
    SearchUsersQuery.prototype.run = function (data) {
        return this._UserModel.search(data);
    };
    return SearchUsersQuery;
}());
exports.SearchUsersQuery = SearchUsersQuery;
//# sourceMappingURL=search-users.query.js.map