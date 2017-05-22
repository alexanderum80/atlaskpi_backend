"use strict";
var common_1 = require("../../common");
var _1 = require("../../");
var mongoose = require("mongoose");
var Promise = require("bluebird");
var validate = require("validate.js");
var Schema = mongoose.Schema;
var INamedTypeSchema = new Schema({
    id: Number,
    name: String
});
var BusinessUnitSchema = new Schema({
    name: String,
    industry: INamedTypeSchema,
    subIndustry: INamedTypeSchema,
    shortName: String,
    active: Boolean,
    phone: String,
    website: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    timezone: String,
    timeFormat: String,
    dateFormat: String,
    defaultCurrency: String,
    defaultLanguage: String,
    firstDayOfWeek: String
});
// BusinessUnitSchema.methods.
// BusinessUnitSchema.statics.
BusinessUnitSchema.statics.createBusinessUnit = function (details) {
    var that = this;
    return new Promise(function (resolve, reject) {
        var constraints = {
            name: { presence: { message: '^cannot be blank' } },
            industry: { presence: { message: '^cannot be blank' } }
        };
        var errors = validate(details, constraints, { fullMessages: false });
        if (errors) {
            resolve(_1.MutationResponse.fromValidationErrors(errors));
            return;
        }
        ;
        that.create(details, function (err, businessUnit) {
            if (err) {
                reject({ message: 'There was an error creating the businessUnit', error: err });
                return;
            }
            resolve({ entity: businessUnit });
        });
    });
};
BusinessUnitSchema.statics.allBusinessUnits = function (details) {
    var paginator = new common_1.Paginator(this, ['name']);
    return paginator.getPage(details);
};
BusinessUnitSchema.statics.findBusinessUnitById = function (id) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.findById(id)
            .then(function (businessUnit) {
            if (businessUnit) {
                resolve({ errors: null, data: businessUnit });
            }
            else {
                resolve({ errors: [{ field: 'businessUnit', errors: ['Not found'] }], data: null });
            }
        })["catch"](function () {
            resolve({ errors: [{ field: 'businessUnit', errors: ['Not Found'] }], data: null });
        });
    });
};
BusinessUnitSchema.statics.updateBusinessUnit = function (id, details) {
    var _this = this;
    var that = this;
    return new Promise(function (resolve, reject) {
        var idError = validate({ id: id }, { id: { presence: { message: '^cannot be blank' } } });
        if (idError) {
            resolve(_1.MutationResponse.fromValidationErrors(idError));
            return;
        }
        var constraints = {
            name: { presence: { message: '^cannot be blank' } },
            active: { presence: { message: '^cannot be blank' } }
        };
        var dataError = validate(details, constraints, { fullMessages: false });
        if (dataError) {
            resolve(_1.MutationResponse.fromValidationErrors(dataError));
            return;
        }
        _this.findById(id).then(function (businessUnit) {
            if (!businessUnit) {
                resolve({ errors: [{ field: 'businessUnit', errors: ['Not found'] }], entity: null });
                return;
            }
            Object.assign(businessUnit, details);
            businessUnit.save(function (err, businessUnit) {
                if (err) {
                    reject({ message: 'There was an error updating the user', error: err });
                    return;
                }
                resolve({ entity: businessUnit });
            });
        })["catch"](function (err) {
            resolve(_1.MutationResponse.fromValidationErrors({ success: false, reason: err }));
        });
    });
};
BusinessUnitSchema.statics.removeBusinessUnitById = function (id) {
    var _this = this;
    var that = this;
    return new Promise(function (resolve, reject) {
        var idError = validate({ id: id }, { id: { presence: { message: '^cannot be blank' } } });
        if (idError) {
            resolve(_1.MutationResponse.fromValidationErrors(idError));
        }
        _this.findById(id).then(function (businessUnit) {
            if (!businessUnit) {
                resolve({ errors: [{ field: 'businessUnit', errors: ['Not found'] }], entity: null });
                return;
            }
            var deletedBusinessUnit = businessUnit;
            businessUnit.remove(function (err, businessUnit) {
                if (err) {
                    reject({ message: 'There was an error removing the businessUnit', error: err });
                    return;
                }
                resolve({ entity: deletedBusinessUnit });
            });
        });
    });
};
function getBusinessUnitModel(m) {
    return m.model('BusinessUnit', BusinessUnitSchema, 'businessUnits');
}
exports.getBusinessUnitModel = getBusinessUnitModel;
//# sourceMappingURL=BusinessUnit.js.map