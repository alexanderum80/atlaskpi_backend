
import { IChartOptions } from './chart-type';
import * as Handlebars from 'handlebars';

const chartTemplate = `
    "chart": {
        "type": "{{type}}"
    },
    "title": {
        "text": "{{title}}"
    },
    "subtitle": {
        "text": "{{subtitle}}"
    },
    "plotOptions": {
        "pie": {
            "dataLabels": {
                "enabled": true
            },
            "showInLegend": false
        }
    }
`;


export class PieChart implements IChartOptions {
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