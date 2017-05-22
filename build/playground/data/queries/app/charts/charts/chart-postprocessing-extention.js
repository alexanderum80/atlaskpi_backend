"use strict";
var _ = require("lodash");
var moment = require("moment");
var serieElementsToCategories = function (series) {
    var categories = [];
    series.forEach(function (s) {
        s.data.forEach(function (d) {
            categories.push(d[0]);
        });
    });
    categories = _.uniq(categories).sort();
    return categories;
};
var Names = ['Wilson', 'Chase', 'Cameron', 'Foreman', 'Taub', 'Hadley', 'Masters'];
var ChartPostProcessingExtention = (function () {
    function ChartPostProcessingExtention() {
    }
    ChartPostProcessingExtention.prototype.process = function (chart, series) {
        var code = chart.kpis[0].code;
        // assign the series to the chart
        chart.chartDefinition.series = series;
        switch (code) {
            case 'AestheticianRevenueRatePerHour':
                chart.chartDefinition = this._withColorBars(chart.chartDefinition);
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'AmbulatorySurgeryCenterSales':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'ConsultingResearchSales':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'IndividualNonPhysicianRevenueRatePerHour':
                chart.chartDefinition = this._withColorBars(chart.chartDefinition);
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'ProfesionalServiceSales':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'RetailSalesRatio':
                chart.chartDefinition = this._withColorBars(chart.chartDefinition);
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'ProfesionalSalesRatio':
                chart.chartDefinition = this._withColorBars(chart.chartDefinition);
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'ConsultingResearchServiceRatio':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'AmbulatorySurgeryCenterServiceRatio':
                chart.chartDefinition = this._withColorBars(chart.chartDefinition);
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'OtherSalesRatio':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'AvgRevenueByFTPhysician':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'AvgRevenueByFTNonPhysician':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'AvgRevenueByFTAesthetician':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'NetRevenueByFTE':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'SalesByProduct':
                series = this._trimSerieNames(series, 16);
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'TotalRevenue':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            case 'RetailSales':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);
            default:
                // no post-processing
                return chart.chartDefinition;
        }
    };
    ChartPostProcessingExtention.prototype._serieToCategories = function (series, definition) {
        var xAxis = definition.xAxis || {};
        xAxis.categories = serieElementsToCategories(series);
        definition.xAxis = xAxis;
        return definition;
    };
    ChartPostProcessingExtention.prototype._withColorBars = function (definition) {
        var plotOptions = definition.plotOptions || {};
        plotOptions.series = plotOptions.series || {};
        plotOptions.series.colorByPoint = true;
        definition.plotOptions = plotOptions;
        return definition;
    };
    ChartPostProcessingExtention.prototype._nameToEmployees = function (series) {
        return series.filter(function (s, index) {
            s.name = Names[index];
            return s;
        });
    };
    ChartPostProcessingExtention.prototype._serieToMonthNameCategories = function (series, definition) {
        var xAxis = definition.xAxis || {};
        xAxis.categories = serieElementsToCategories(series).map(function (s) {
            return moment(s + '-01').format('MMM');
        });
        definition.xAxis = xAxis;
        return definition;
    };
    ChartPostProcessingExtention.prototype._trimSerieNames = function (series, length) {
        if (length === void 0) { length = 12; }
        return series.filter(function (s) {
            if (s.name.length > length) {
                s.name = s.name.substring(0, length - 1) + '...';
            }
            return s;
        });
    };
    return ChartPostProcessingExtention;
}());
exports.ChartPostProcessingExtention = ChartPostProcessingExtention;
//# sourceMappingURL=chart-postprocessing-extention.js.map