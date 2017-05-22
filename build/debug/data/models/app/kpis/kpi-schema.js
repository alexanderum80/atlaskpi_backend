"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var pagination_1 = require("../../common/pagination");
var common_1 = require("../../common");
var mongoose = require("mongoose");
var Promise = require("bluebird");
var validate = require("validate.js");
var Schema = mongoose.Schema;
var KPISchema = new Schema({
    _id: String,
    code: String,
    name: String,
    description: String,
    formula: String,
    group: String,
    grouping: Schema.Types.Mixed,
    filter: String,
    axisSelection: String,
    emptyValueReplacement: String
});
KPISchema.statics.createKPI = function (data) {
    var that = this;
    return new Promise(function (resolve, reject) {
        var constraints = {
            name: { presence: { message: '^cannot be blank' } },
            formula: { presence: { message: '^cannot be blank' } }
        };
        var errors = validate(data, constraints, { fullMessages: false });
        // let errors = (<any>validate)((<any>details).details, constraints, {fullMessages: false});
        if (errors) {
            resolve(common_1.MutationResponse.fromValidationErrors(errors));
            return;
        }
        var newKPI = __assign({}, data);
        that.create(newKPI, function (err, kpi) {
            if (err) {
                reject({ message: 'There was an error creating the kpi', error: err });
                return;
            }
            resolve({ entity: kpi });
        });
    });
};
KPISchema.statics.updateKPI = function (id, data) {
    var _this = this;
    var that = this;
    var document;
    var promises = [];
    return new Promise(function (resolve, reject) {
        var idError = validate({ id: id }, { id: { presence: { message: '^cannot be blank' } } });
        if (idError) {
            resolve(common_1.MutationResponse.fromValidationErrors(idError));
            return;
        }
        var dataError = validate({ data: data }, { data: { presence: { message: '^cannot be empty' } } });
        if (dataError) {
            resolve(common_1.MutationResponse.fromValidationErrors(dataError));
            return;
        }
        _this.findById(id).then(function (kpi) {
            var constraints = {
                document: { presence: { message: '^not found' } }
            };
            var errors = validate({ id: id, document: kpi }, constraints, { fullMessages: false });
            if (errors) {
                resolve(common_1.MutationResponse.fromValidationErrors(errors));
                return;
            }
            //mods
            if (data.name) {
                kpi.name = data.name;
            }
            ;
            if (data.description) {
                kpi.description = data.description;
            }
            ;
            if (data.group) {
                kpi.group = data.group;
            }
            ;
            if (data.formula) {
                kpi.formula = data.formula;
            }
            ;
            if (data.emptyValueReplacement) {
                kpi.emptyValueReplacement = data.emptyValueReplacement;
            }
            ;
            kpi.save(function (err, kpi) {
                if (err) {
                    reject({ message: 'There was an error updating the kpi', error: err });
                    return;
                }
                resolve({ entity: kpi });
            });
        });
    });
};
KPISchema.statics.removeKPI = function (id) {
    var _this = this;
    var that = this;
    var document;
    var promises = [];
    return new Promise(function (resolve, reject) {
        var idError = validate({ id: id }, { id: { presence: { message: '^cannot be blank' } } });
        if (idError) {
            resolve(common_1.MutationResponse.fromValidationErrors(idError));
        }
        _this.findById(id).then(function (kpi) {
            var constraints = {
                document: { presence: { message: '^not found' } }
            };
            var errors = validate({ id: id, document: kpi }, constraints, { fullMessages: false });
            if (errors) {
                resolve(common_1.MutationResponse.fromValidationErrors(errors));
            }
            var deletedKPI = kpi;
            kpi.remove(function (err, kpi) {
                if (err) {
                    reject({ message: 'There was an error removing the kpi', error: err });
                    return;
                }
                resolve({ entity: deletedKPI });
            });
        });
    });
};
KPISchema.statics.getAllKPIs = function (details) {
    var paginator = new pagination_1.Paginator(this, ['name']);
    return paginator.getPage(details);
};
function getKPIModel(m) {
    return m.model('KPI', KPISchema, 'kpis');
}
exports.getKPIModel = getKPIModel;
//# sourceMappingURL=kpi-schema.js.map