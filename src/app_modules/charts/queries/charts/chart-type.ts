export const ChartType = {
    Area: 'area',
    AreaRange: 'arearange',
    AreaSpline: 'areaSpline',
    AreaSplineRange: 'areasplinerange',
    Bar: 'bar',
    BoxPlot: 'boxplot',
    Bubble: 'bubble',
    Column: 'column',
    ColumnRange: 'columnrange',
    ErrorBar: 'errorbar',
    Funnel: 'funnel',
    Gauge: 'gauge',
    HeatMap: 'heatmap',
    Line: 'line',
    Pie: 'pie',
    Donut: 'donut',
    Polygon: 'polygon',
    Pyramid: 'pyramid',
    Scatter: 'scatter',
    Series: 'series',
    SolidGauge: 'solidgauge',
    Spline: 'spline',
    TreeMap: 'treemap',
    Waterfall: 'waterfall',
    AreaBar: 'area-bar',
    AreaColumn: 'area-column',
    BarLine: 'bar-line',
    BarSpLine: 'bar-spline',
    ColumnLine: 'column-line',
    ColumnSpLine: 'column-spline',
};

// export interface ChartPlotOptions {

// }

export interface IChartOptions {
    type: string;
    title: string;
    subtitle: string;
    series: any;
}