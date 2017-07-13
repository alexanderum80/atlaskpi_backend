import * as Promise from 'bluebird';
// import { ChartProcessor } from './chart-processor';
import { IAppModels } from '../../../models/app/app-models';

export class ChartCollection {

    constructor(private _ctx: IAppModels) {}

    public getCharts(data: { from: Date, to: Date, preview: boolean }): Promise<string> {
        let that = this;

        return new Promise<string>((resolve, reject) => {
            let definitions = [];

            this._ctx.Chart.find().then(charts => {
                charts.forEach(chart => {
                    let payload = {
                        id: chart._id,
                        from: data.from,
                        to: data.to
                    };

                    if (data.preview) {
                        definitions.push(chart);
                    }
                });

                 Promise.all(definitions).then(data => {
                    resolve(JSON.stringify(data));
                });
            });

        });
    }

}