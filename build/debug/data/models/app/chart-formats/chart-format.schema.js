"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var common_1 = require("../../common");
var pagination_1 = require("../../common/pagination");
var validate = require("validate.js");
var logger = require("winston");
var Schema = mongoose.Schema;
var ChartFormatSchema = new Schema({
    name: String,
    type: String,
    typeFormat: {
        before: String,
        after: String,
        decimal: Number,
        formula: String
    }
});
ChartFormatSchema.statics.createChartFormat = function (details) {
    var that = this;
    return new Promise(function (resolve, reject) {
        var constraints = {
            name: { presence: { message: '^cannot be blank' } }
        };
        var errors = validate(details.details, constraints, { fullMessages: false });
        if (errors) {
            resolve(common_1.MutationResponse.fromValidationErrors(errors));
        }
        var newChart = {
            name: details.details.name,
            type: details.details.type,
            typeFormat: {
                after: undefined,
                before: undefined,
                decimal: undefined,
                formula: undefined
            }
        };
        if (details.details.typeFormat.before)
            newChart.typeFormat.before = details.details.typeFormat.before;
        if (details.details.typeFormat.after)
            newChart.typeFormat.after = details.details.typeFormat.after;
        if (details.details.typeFormat.decimal)
            newChart.typeFormat.decimal = parseFloat(details.details.typeFormat.decimal);
        if (details.details.typeFormat.formula)
            newChart.typeFormat.formula = details.details.typeFormat.formula;
        that.create(newChart, function (err, chart) {
            if (err) {
                reject({ message: 'There was an error creating the chartFormat', error: err });
                return;
            }
            resolve({ entity: chart });
        });
    });
};
ChartFormatSchema.statics.getAllChartFormats = function (details) {
    var paginator = new pagination_1.Paginator(this, ['name']);
    return paginator.getPage(details);
};
ChartFormatSchema.statics.updateChartFormat = function (id, data) {
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
        }
        _this.findById(id).then(function (chart) {
            var constraints = {
                document: { presence: { message: '^not found' } }
            };
            var errors = validate({ id: id, document: chart }, constraints, { fullMessages: false });
            if (errors) {
                resolve(common_1.MutationResponse.fromValidationErrors(errors));
                return;
            }
            // mods
            if (data.name) {
                chart.name = data.name;
            }
            ;
            if (data.type) {
                chart.type = data.type;
            }
            ;
            if (data.typeFormat) {
                if (data.typeFormat.before) {
                    chart.typeFormat.before = data.typeFormat.before;
                }
                ;
                if (data.typeFormat.before) {
                    chart.typeFormat.before = data.typeFormat.before;
                }
                ;
                if (data.typeFormat.after) {
                    chart.typeFormat.after = data.typeFormat.after;
                }
                ;
                if (data.typeFormat.decimal) {
                    chart.typeFormat.decimal = parseFloat(data.typeFormat.decimal);
                }
                ;
                if (data.typeFormat.formula) {
                    chart.typeFormat.formula = data.typeFormat.formula;
                }
                ;
            }
            ;
            chart.save(function (err, chart) {
                if (err) {
                    reject({ message: 'There was an error updating the chart', error: err });
                    return;
                }
                resolve({ entity: chart });
            });
        });
    });
};
ChartFormatSchema.statics.removeChartFormat = function (id) {
    var _this = this;
    var that = this;
    var document;
    var promises = [];
    return new Promise(function (resolve, reject) {
        var idError = validate({ id: id }, { id: { presence: { message: '^cannot be blank' } } });
        if (idError) {
            resolve(common_1.MutationResponse.fromValidationErrors(idError));
        }
        _this.findById(id).then(function (chart) {
            var constraints = {
                document: { presence: { message: '^not found' } }
            };
            var errors = validate({ id: id, document: chart }, constraints, { fullMessages: false });
            if (errors) {
                resolve(common_1.MutationResponse.fromValidationErrors(errors));
            }
            var deletedChartFormat = chart;
            chart.remove(function (err, chart) {
                if (err) {
                    reject({ message: 'There was an error removing the chart', error: err });
                    return;
                }
                resolve({ entity: deletedChartFormat });
            });
        });
    });
};
ChartFormatSchema.statics.getChartFormatById = function (data) {
    var _this = this;
    var that = this;
    var document;
    var promises = [];
    return new Promise(function (resolve, reject) {
        _this.findById(data.id)
            .then(function (chart) {
            if (!chart) {
                reject({ success: false, reason: { name: 'not found', message: 'Chart not found' } });
            }
            resolve({ data: chart });
        }, function (err) {
            logger.error(err);
            reject({ success: false, reason: { message: 'Error retrieving Chart Format' } });
        });
    });
};
function getChartFormatModel(m) {
    return m.model('ChartFormat', ChartFormatSchema, 'chartFormats');
}
exports.getChartFormatModel = getChartFormatModel;
//# sourceMappingURL=chart-format.schema.js.map