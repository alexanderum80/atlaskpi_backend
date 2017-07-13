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

        // Chart Series
        chart.chartDefinition.series = series;

        // Chart Category Names
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
                let start = this._getFirstMonthInSerie(series);
                let end = this._getLastMonthInSerie(series);
                let newSerie = this._fillEmptyMonthsWithNull(series, start, end);
                newSerie = this._getRidOfFrequency(newSerie);
                chart.chartDefinition.series = this._hideSeriesWhenMoreThanX(newSerie);

                return this._serieToMonthNameCategories(series, chart.chartDefinition);

            case 'RetailSales':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);

            case 'TotalExpense':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);

            case 'CostOfGoodSold':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);

            case 'ExpenseByCategory':
                return this._serieToMonthNameCategories(series, chart.chartDefinition);

            case 'ExpenseRatio':
                chart.chartDefinition = this._withColorBars(chart.chartDefinition);
                return this._serieToMonthNameCategories(series, chart.chartDefinition);

            case 'PayrollExpenseRatio':
                chart.chartDefinition = this._withColorBars(chart.chartDefinition);
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
         let categories = _.map(serieElementsToCategories(series), c => c.split('-')[1]);
         categories = _.uniq(categories).sort();
         // moment.js enumerate the monthnames starting 0
         xAxis.categories = categories.map(c => moment().month(Number(c) - 1).format('MMM'));
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

    private _getRidOfFrequency(series: any[]) {
        let newSeries = series.map(
            s => {
                let serie: any = {};
                serie.name = s.name;
                serie.data = s.data.map(d => {
                    return d[1];
                });

                return serie;
            }
        );


        return newSeries;
    }

    // months numbers starting 0
    private _fillEmptyMonthsWithNull(series: any[], startingMonth: number, endingMonth: number): any[] {
        let data = series.map(s => {
            let year = s.name;
            let serieData = [];
            for (let currMonth = startingMonth; currMonth <= endingMonth; currMonth++) {
                let value = s.data.find(d => { return Number(d[0].split('-')[1]) === currMonth; });
                if (value) {
                    serieData.push(value);
                } else {
                    serieData.push([`${year}-${this._formatNumber(currMonth)}`, null]);
                }
            };

            return { name: year, data: serieData };
        });

        return data;
    }

    private _getFirstMonthInSerie(series: any[]) {
        // months numbers starting 0 (as momentjs)
        let month = 11;

        series.forEach(s => {
            s.data.forEach(d => {
                let thisMonth = Number(d[0].split('-')[1]);
                if (thisMonth < month) { month = thisMonth; };
            });
        });

        return month;
    }

    private _getLastMonthInSerie(series: any[]) {
        // months numbers starting 0 (as momentjs)
        let month = 0;

        series.forEach(s => {
            s.data.forEach(d => {
                let thisMonth = Number(d[0].split('-')[1]);
                if (thisMonth > month) { month = thisMonth; };
            });
        });

        return month;
    }

    private _formatNumber(n: number, length = 2) {
        return (n < 10)
                ? '0' + n
                : n;
    }

    private _hideSeriesWhenMoreThanX(series: any[], visibleSeries = 3) {
        if (series.length <= visibleSeries) { return series; };

        let index = 0;
        let hiddenSeries = series.map(s => {
            let newSerie = Object.assign({}, s);
            if (series.length - visibleSeries > index) {
                newSerie = Object.assign(newSerie, { visible: false });
            }
            index++;
            return newSerie;
        });

        return hiddenSeries;
    }
}

