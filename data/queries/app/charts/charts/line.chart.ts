import { IUChart } from './chart-base';

export class LineChart extends UIChart implements IUIChartWithType {
    type: string = 'pie';
    title: string;
    subtitle: string;
    plotOptions: any;
    series: any;

    constructor(private data: any, opts: IChartOptions) {
        Object.assign(this, opts);
    }

    is3d = false;

}