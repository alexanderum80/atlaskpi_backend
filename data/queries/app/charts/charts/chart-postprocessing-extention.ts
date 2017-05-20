import { IChart } from '../../../../models/app/charts';
import * as _ from 'lodash';
import * as moment from 'moment';

const serieElementsToCategories = function(series: any[]) {
        let categories = [];
        series.forEach(s => {
            s.data.forEach(d => {
                categories.push(d[0]);
            });
        });

        categories = _.uniq(categories).sort();

        return categories;
};

const Names = ['Wilson', 'Chase', 'Cameron', 'Foreman', 'Taub', 'Hadley', 'Masters' ];

export class ChartPostProcessingExtention {

    process(chart: IChart, series: any[]) {
        let code = chart.kpis[0].code;

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
                 series = this._nameToEmployees(series);
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
    }

    private _serieToCategories(series: any[], definition: any): any {
         let xAxis = definition.xAxis || {};
         xAxis.categories = serieElementsToCategories(series);
         definition.xAxis = xAxis;
         return definition;
    }

    private _withColorBars(definition: any): any {
        let plotOptions = definition.plotOptions || {};
        plotOptions.series = plotOptions.series || {};
        plotOptions.series.colorByPoint = true;

        definition.plotOptions = plotOptions;

        return definition;
    }

    private _nameToEmployees(series: any[]) {
         return series.filter((s, index) => {
             s.name = Names[index];
             return s;
        });
    }

    private _serieToMonthNameCategories(series: any[], definition: any): any {
         let xAxis = definition.xAxis || {};
         xAxis.categories = serieElementsToCategories(series).map(s => {
             return moment(s + '-01').format('MMM');
         });
         definition.xAxis = xAxis;
         return definition;
    }

    private _trimSerieNames(series: any[], length = 12) {
        return series.filter(s => {
            if (s.name.length > length) {
                s.name = s.name.substring(0, length - 1) + '...';
            }
            return s;
        });
    }
}

