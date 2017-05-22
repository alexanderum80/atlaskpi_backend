"use strict";
var MutationResponse = (function () {
    function MutationResponse() {
    }
    /**
     * Create a new instance of a Mutation response when there are validation errors
     * I am expecting the error format form the validate library which is:
     * { field: ['error1', 'error2'] }
     */
    MutationResponse.fromValidationErrors = function (errors) {
        var response = new MutationResponse();
        if (!errors) {
            return response;
        }
        response.errors = [];
        Object.keys(errors).forEach(function (key) {
            var error = {
                field: key,
                errors: errors[key]
            };
            response.errors.push(error);
        });
        return response;
    };
    MutationResponse.prototype.localized = function (req) {
        // localize errors messages in case they exist
        if (this.errors) {
            this.errors.forEach(function (err) {
                err.errors = err.errors.map(function (errorText) { return req.__(errorText); });
            });
        }
        return this;
    };
    return MutationResponse;
}());
exports.MutationResponse = MutationResponse;
// export interface IMutationResult {
//     errors?: IErrorDetails[];
//     success: boolean;
// }
//# sourceMappingURL=mutation-response.js.map