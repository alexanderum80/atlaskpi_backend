"use strict";
var _1 = require("../../");
var mongoose = require("mongoose");
var Promise = require("bluebird");
var validate = require("validate.js");
var winston = require("winston");
function resolveKpi(context, kpi, done) {
    if (typeof kpi === 'string') {
        context.model('KPI').findOne({ name: kpi }, function (err, kpi) {
            console.log('kpi found: ' + kpi);
            if (err)
                return done(err);
            if (!kpi)
                return done(new Error('Unknown kpi: ' + kpi));
            done(null, kpi);
        });
    }
    else {
        done(null, kpi);
    }
}
exports.resolveKpi = resolveKpi;
var Schema = mongoose.Schema;
var ChartDateRangeSchema = new Schema({
    predefined: String,
    custom: {
        from: String,
        to: String
    }
});
var ChartSchema = new Schema({
    _id: String,
    name: String,
    group: String,
    description: String,
    frequency: String,
    xFormat: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartFormat' },
    yFormat: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartFormat' },
    kpis: [{ type: mongoose.Schema.Types.String, ref: 'KPI' }],
    dataRange: ChartDateRangeSchema,
    chartDefinition: Schema.Types.Mixed
});
// ChartSchema.methods.
ChartSchema.methods.hasKpi = function (kpi, done) {
    var obj = this;
    this.resolveRole(this, kpi, function (err, kpi) {
        if (err)
            return done(err);
        var hasKpi = false;
        obj.kpis.forEach(function (existing) {
            if ((existing._id && existing._id.equals(kpi._id)) ||
                (existing.toString() === kpi.id)) {
                hasKpi = true;
            }
        });
        done(null, hasKpi);
    });
};
ChartSchema.methods.addKpi = function (kpi, done) {
    var obj = this;
    this.resolveKpi(this, kpi, function (err, kpi) {
        if (err)
            return done(err);
        obj.hasKpi(kpi, function (err, has) {
            if (err)
                return done(err);
            if (has)
                return done(null, obj);
            obj.kpis = [kpi._id].concat(obj.kpis);
            obj.save(done);
        });
    });
};
// ChartSchema.statics.
ChartSchema.statics.createChart = function (details) {
    var that = this;
    return new Promise(function (resolve, reject) {
        var constraints = {
            name: { presence: { message: '^cannot be blank' } },
            frecuency: { presence: { message: '^cannot be blank' } }
        };
        var errors = validate(details, constraints, { fullMessages: false });
        if (errors) {
            resolve(_1.MutationResponse.fromValidationErrors(errors));
            return;
        }
        ;
        var newChart = {
            name: details.name,
            dataRange: details.dataRange,
            description: details.description,
            frequency: details.frequency,
            group: details.group,
            kpis: [],
            format: details.chartFormat
        };
        that.create(newChart, function (err, chart) {
            if (err) {
                reject({ message: 'There was an error creating the chart', error: err });
                return;
            }
            // adding kpis
            if (details.kpis && details.kpis.length > 0) {
                chart.kpis = null;
                details.kpis.forEach(function (kpi) {
                    chart.addKpi(kpi, function (err, role) {
                        if (err) {
                            winston.error('Error adding role: ', err);
                        }
                    });
                });
            }
            ;
            resolve({ entity: chart });
        });
    });
};
function getChartModel(m) {
    return m.model('Chart', ChartSchema, 'charts');
}
exports.getChartModel = getChartModel;
//# sourceMappingURL=Chart.js.map