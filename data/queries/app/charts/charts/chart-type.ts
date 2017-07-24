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
    Waterfall: 'waterfall'
};

// export interface ChartPlotOptions {

// }

export interface IChartOptions {
    type: string;
    title: string;
    subtitle: string;
    series: any;
}