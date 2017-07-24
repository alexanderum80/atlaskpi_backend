import { IAppModels } from '../models/app/app-models';
import { IChart,
        // IChartDetails,
        IChartDocument } from '../models/app/charts';
import { getContext } from '../models';
import * as winston from 'winston';


// const newCharts: IChartDetails[] = [
//        {
//          name: 'Chart1',
//          description: 'Random description for chat #1',
//          group: 'group 1',
//          frequency: 'semanal',
//          kpis: ['fran', 'new'],
//          chartFormat: 'Formato1',
//          dataRange: { predefined: 'Daily'}
//       },
//       {
//          name: 'Chart2',
//          description: 'Random description for chat #2',
//          group: 'group 2',
//          frequency: 'semanal',
//          kpis: ['lolo', 'cuco'],
//          chartFormat: 'Formato2',
//          dataRange: { predefined: 'Daily'}
//       }
// ];

export default function seedCharts(ctx: IAppModels) {

        // ctx.Chart.find({}).then((charts) => {
        //       if (charts.length > 0) {
        //           return;
        //       }

        //     winston.debug('Seeding business units for customer2');

        //     newCharts.forEach((chart: IChartDetails) => {
        //         ctx.Chart.createChart(chart).then((response) => {
        //             winston.info(`seeded chart: ${response.entity.name}`);
        //         }, (err) => {
        //             winston.error('Error creating Chart: ', err);
        //         });
        //     });
        // });

};