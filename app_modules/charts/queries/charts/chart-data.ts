export interface IChartData {

    /**
     * Chart Title
     */
    title: string;

    /**
     * Chart subtitle
     */
    subtitle: string;

    /**
     * Allows labels positioning anywhere in the chart
     */
    labels: any;

    /**
     * Filed used to customize the noData message
     */
    noData: any;

    /**
     * Options applies to the ploting area
     */
    plotOptions: any;

    /**
     * Based on the graph type the series get prepared
     */
    prepareSeries(data: any): any;
}